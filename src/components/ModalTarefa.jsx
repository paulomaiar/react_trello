import { useState, useEffect } from 'react';
import styles from './ModalTarefa.module.css';
import { useAuth } from '../context/useAuthHook'
import { mensagensDeErro } from '../services/api'
import { paraNumero } from '../utils/paraNumero'

function ModalTarefa({
    aberto,
    onFechar,
    onSalvar,
    tarefa = null,
    coluna = 'A FAZER',
    prioridades = [],
    usuarios = [],
    projetos = [],
    onCriarProjeto,
}) {
    const { usuario } = useAuth()
    const [texto, setTexto] = useState(() => tarefa?.texto || '')
    const [idPrioridade, setIdPrioridade] = useState(() => tarefa?.idprioridade ?? 2)
    const [idUsuario, setIdUsuario] = useState(() => (
        tarefa?.usuario_id ?? tarefa?.usuarioId ?? usuario?.id ?? usuarios[0]?.id ?? ''
    ))
    const [idProjeto, setIdProjeto] = useState(() => (
        tarefa?.projeto_id ?? tarefa?.projetoId ?? projetos[0]?.id ?? ''
    ))
    const [criandoProjeto, setCriandoProjeto] = useState(() => !tarefa && projetos.length === 0)
    const [novoProjetoNome, setNovoProjetoNome] = useState('')
    const [erros, setErros] = useState([])
    const [salvando, setSalvando] = useState(false)
    const podeEditar = !tarefa || Number(tarefa.criadoPorId ?? tarefa.criado_por_id) === Number(usuario?.id)

    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (tarefa) {
            setTexto(tarefa.texto || '')
            setIdPrioridade(tarefa.idprioridade ?? 2)
            setIdUsuario(tarefa.usuario_id ?? tarefa.usuarioId ?? '')
            setIdProjeto(tarefa.projeto_id ?? tarefa.projetoId ?? '')
        } else {
            setTexto('')
            setIdPrioridade(2)
            setIdUsuario(usuario?.id || usuarios[0]?.id || '')
            setIdProjeto((idAtual) => (
                idAtual && projetos.some((item) => String(item.id) === String(idAtual))
                    ? idAtual
                    : projetos[0]?.id || ''
            ))
        }
        setErros([])
    }, [tarefa, aberto, usuario?.id, usuarios, projetos])
    /* eslint-enable react-hooks/set-state-in-effect */

    useEffect(() => {
        if (!aberto) return undefined

        function handleEsc(event) {
            if (event.key === 'Escape') onFechar()
        }

        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [aberto, onFechar])

    async function handleSalvar() {
        if (!podeEditar) return
        if (criandoProjeto && !novoProjetoNome.trim()) {
            setErros(['Informe o nome do projeto'])
            return
        }
        if (!criandoProjeto && !idProjeto) {
            setErros(['Selecione um projeto'])
            return
        }

        setSalvando(true)
        setErros([])

        try {
            let projetoId = idProjeto
            if (criandoProjeto) {
                if (!onCriarProjeto) {
                    throw new Error('A criação de projetos não está disponível.')
                }
                const projetoCriado = await onCriarProjeto({ nome: novoProjetoNome.trim() })
                if (!projetoCriado?.id) {
                    throw new Error('A API não retornou o projeto criado.')
                }
                projetoId = projetoCriado.id
                setIdProjeto(projetoId)
                setCriandoProjeto(false)
                setNovoProjetoNome('')
            }

            const dados = {
                id: tarefa?.id,
                texto,
                idprioridade: paraNumero(idPrioridade),
                usuario_id: paraNumero(idUsuario),
                projeto_id: paraNumero(projetoId),
                coluna: tarefa?.coluna || coluna,
            }
            await onSalvar(dados)
            onFechar()
        } catch (erro) {
            setErros(mensagensDeErro(erro))
        } finally {
            setSalvando(false)
        }
    }

    return (
        <div className={styles.overlay} onClick={onFechar}>
            <div className={styles.card} onClick={(event) => event.stopPropagation()}>
                <h2>{tarefa ? 'Editar tarefa' : 'Nova tarefa'}</h2>

                <div className={styles.campo}>
                    <label htmlFor="tarefa-texto">Tarefa</label>
                    <input
                        id="tarefa-texto"
                        placeholder="Texto da tarefa"
                        value={texto}
                        onChange={(event) => setTexto(event.target.value)}
                        disabled={!podeEditar}
                    />
                </div>

                <div className={styles.campo}>
                    <label htmlFor="tarefa-usuario">Responsável</label>
                    <select id="tarefa-usuario" value={idUsuario} onChange={(event) => setIdUsuario(event.target.value)} disabled={!podeEditar}>
                        <option value="">Selecione um responsável</option>
                        {usuarios.map((item) => (
                            <option key={item.id} value={item.id}>{item.nome}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.campo}>
                    <label htmlFor={criandoProjeto ? 'novo-projeto-nome' : 'tarefa-projeto'}>Projeto</label>
                    {criandoProjeto ? (
                        <>
                            <input
                                id="novo-projeto-nome"
                                placeholder="Nome do novo projeto"
                                value={novoProjetoNome}
                                onChange={(event) => setNovoProjetoNome(event.target.value)}
                                disabled={!podeEditar}
                            />
                            {projetos.length > 0 && (
                                <button
                                    type="button"
                                    className={styles.botaoProjeto}
                                    onClick={() => setCriandoProjeto(false)}
                                    disabled={!podeEditar}
                                >
                                    Selecionar projeto existente
                                </button>
                            )}
                        </>
                    ) : (
                        <div className={styles.selecaoProjeto}>
                            <select
                                id="tarefa-projeto"
                                value={idProjeto}
                                onChange={(event) => setIdProjeto(event.target.value)}
                                disabled={!podeEditar}
                            >
                                <option value="">Selecione um projeto</option>
                                {idProjeto && !projetos.some((item) => String(item.id) === String(idProjeto)) && (
                                    <option value={idProjeto}>{tarefa?.projetoNome || 'Projeto atual'}</option>
                                )}
                                {projetos.map((item) => (
                                    <option key={item.id} value={item.id}>{item.nome}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                className={styles.botaoProjeto}
                                onClick={() => setCriandoProjeto(true)}
                                disabled={!podeEditar}
                            >
                                + Novo Projeto
                            </button>
                        </div>
                    )}
                </div>

                <div className={styles.campo}>
                    <label htmlFor="tarefa-prioridade">Prioridade</label>
                    <select id="tarefa-prioridade" value={idPrioridade} onChange={(event) => setIdPrioridade(event.target.value)} disabled={!podeEditar}>
                        {prioridades.map((item) => (
                            <option key={item.id} value={item.id}>{item.descricao}</option>
                        ))}
                    </select>
                </div>

                {erros.length > 0 && (
                    <ul className={styles.erros}>
                        {erros.map((msg, i) => <li key={i}>{msg}</li>)}
                    </ul>
                )}

                <div className={styles.botoes}>
                    <button onClick={onFechar} disabled={salvando}>Cancelar</button>
                    <button onClick={handleSalvar} disabled={salvando || !podeEditar}>
                        {salvando ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ModalTarefa