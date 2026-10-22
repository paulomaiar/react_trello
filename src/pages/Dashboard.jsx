import { useState, useEffect } from 'react'
import PainelTarefas from '../components/PainelTarefas'
import ModalTarefa from '../components/ModalTarefa'
import api, { mensagensDeErro, normalizarPayloadTarefa, normalizarTarefaVisual } from '../services/api'

export default function Dashboard() {
    const [tarefas, setTarefas] = useState([])
    const [listaPrioridades, setListaPrioridades] = useState([])
    const [listaUsuarios, setListaUsuarios] = useState([])
    const [listaProjetos, setListaProjetos] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [erroCarregamento, setErroCarregamento] = useState(null)
    const [filtro, setFiltro] = useState('all')
    const [filtroPrioridade, setFiltroPrioridade] = useState('todas')
    const [modalAberto, setModalAberto] = useState(false)
    const [tarefaEditando, setTarefaEditando] = useState(null)
    const [colunaAtiva, setColunaAtiva] = useState('A FAZER')
    useEffect(() => {
        async function carregarTarefas() {
            try {
                const [respostaPrioridades, respostaTarefas, respostaUsuarios, respostaProjetos] = await Promise.all([
                    api.get('/prioridades'),
                    api.get('/tarefas'),
                    api.get('/usuarios'),
                    api.get('/projetos'),
                ])
                setListaPrioridades(respostaPrioridades.data)
                setTarefas(respostaTarefas.data)
                setListaUsuarios(respostaUsuarios.data)
                setListaProjetos(respostaProjetos.data)
                setErroCarregamento(null)
            } catch (erro) {
                console.error('Erro ao buscar dados do servidor:', erro)
                setErroCarregamento(mensagensDeErro(erro).join(' '))
                setTarefas([])
            } finally {
                setCarregando(false)
            }
        }

        carregarTarefas()
    }, [])

    useEffect(() => {
        const pendentes = tarefas.filter((tarefa) => !(tarefa.concluida || tarefa.coluna === 'CONCLUÍDA')).length
        document.title = pendentes > 0 ? `(${pendentes}) TaskFlow` : 'TaskFlow'

        return () => {
            document.title = 'TaskFlow'
        }
    }, [tarefas])

    function abrirModalCriar(coluna = 'A FAZER') {
        setTarefaEditando(null)
        setColunaAtiva(coluna)
        setModalAberto(true)
    }

    function abrirModalEditar(tarefa) {
        setTarefaEditando(tarefa)
        setModalAberto(true)
    }

    async function adicionarTarefa(dadosTarefa) {
        const colunaTarefa = colunaAtiva || 'A FAZER'
        const resposta = await api.post('/tarefas', normalizarPayloadTarefa({
            ...dadosTarefa,
            coluna: dadosTarefa.coluna || colunaTarefa,
        }))
        setTarefas((tarefasAtuais) => [...tarefasAtuais, resposta.data])
    }

    async function handleCriarProjeto(dadosProjeto) {
        const resposta = await api.post('/projetos', dadosProjeto)
        setListaProjetos((projetosAtuais) => [...projetosAtuais, resposta.data])
        return resposta.data
    }

    async function atualizarTarefa(id, dadosAtualizados) {
        const resposta = await api.put(`/tarefas/${id}`, normalizarPayloadTarefa(dadosAtualizados))
        setTarefas((prev) =>
            prev.map((tarefa) => (String(tarefa.id) === String(id) ? resposta.data : tarefa))
        )
    }

    async function moverTarefa(id, dadosAtualizados) {
        try {
            await atualizarTarefa(id, dadosAtualizados)
        } catch (erro) {
            window.alert(mensagensDeErro(erro).join('\n'))
        }
    }

    function atualizarColunaTarefa(id, novaColuna) {
        moverTarefa(id, { coluna: novaColuna })
    }

    function concluirTarefa(id) {
        const tarefa = tarefas.find((t) => t.id === id)

        if (!tarefa) return

        const estaConcluida = tarefa.concluida || tarefa.coluna === 'CONCLUÍDA'
        const novoStatus = !estaConcluida

        moverTarefa(id, { coluna: novoStatus ? 'CONCLUÍDA' : 'A FAZER' })
    }

    async function atualizarPrioridade(id, prioridadeId) {
        moverTarefa(id, { idprioridade: Number(prioridadeId) })
    }

    async function excluirTarefa(id) {
        const confirmado = window.confirm('Tem certeza que deseja excluir esta tarefa?')
        if (!confirmado) return

        try {
            await api.delete(`/tarefas/${id}`)
            setTarefas((tarefasAtuais) => tarefasAtuais.filter((tarefa) => String(tarefa.id) !== String(id)))
        } catch (erro) {
            console.error(`Erro ao excluir a tarefa ${id}:`, erro)
            window.alert(mensagensDeErro(erro).join('\n'))
        }
    }

    const tarefasExibidas = tarefas.map(normalizarTarefaVisual)

    async function handleSalvarTarefa(dadosTarefa) {
        if (dadosTarefa.id) {
            await atualizarTarefa(dadosTarefa.id, dadosTarefa)
        } else {
            await adicionarTarefa(dadosTarefa)
        }

        setModalAberto(false)
        setTarefaEditando(null)
        setColunaAtiva(null)
    }

    if (carregando) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando tarefas...</div>
    }

    if (erroCarregamento) {
        return (
            <div className="dashboard-error">
                <h2>Erro ao carregar tarefas</h2>
                <p>{erroCarregamento}</p>
                <button type="button" onClick={() => window.location.reload()}>Recarregar</button>
            </div>
        )
    }

    return (
        <>
            <PainelTarefas
                sectionHeader="Minhas tarefas"
                tarefas={tarefasExibidas}
                filtro={filtro}
                onFiltroChange={setFiltro}
                filtroPrioridade={filtroPrioridade}
                onFiltroPrioridadeChange={setFiltroPrioridade}
                onAdicionar={abrirModalCriar}
                onEditar={abrirModalEditar}
                onConcluir={concluirTarefa}
                onExcluir={excluirTarefa}
                onAtualizarPrioridade={atualizarPrioridade}
                onAtualizarColuna={atualizarColunaTarefa}
                prioridades={listaPrioridades}
            />
            {modalAberto && (
                <ModalTarefa
                    key={tarefaEditando?.id ?? 'nova'}
                    aberto={modalAberto}
                    onFechar={() => {
                        setModalAberto(false)
                        setTarefaEditando(null)
                        setColunaAtiva(null)
                    }}
                    onSalvar={handleSalvarTarefa}
                    tarefa={tarefaEditando}
                    coluna={colunaAtiva}
                    prioridades={listaPrioridades}
                    usuarios={listaUsuarios}
                    projetos={listaProjetos}
                    onCriarProjeto={handleCriarProjeto}
                />
            )}
        </>
    )
}
        