import { useState, useEffect } from 'react'
import axios from 'axios'
import PainelTarefas from '../components/PainelTarefas'
import ModalTarefa from '../components/ModalTarefa'
import api, { normalizarPayloadTarefa } from '../services/api'

export default function Dashboard() {
    const [tarefas, setTarefas] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [erroAPI, setErroAPI] = useState(null)
    const [filtro, setFiltro] = useState('all')
    const [filtroPrioridade, setFiltroPrioridade] = useState('todas')
    const [modalAberto, setModalAberto] = useState(false)
    const [tarefaEditando, setTarefaEditando] = useState(null)
    const [colunaAtiva, setColunaAtiva] = useState('A FAZER')

    useEffect(() => {
        async function carregarTarefas() {
            try {
                const resposta = await api.get('/tarefas')
                setTarefas(resposta.data)
                setErroAPI(null)
            } catch (erro) {
                console.error('Erro ao buscar dados do servidor:', erro)
                setErroAPI(erro.response?.data?.erro || erro.message || 'Erro ao carregar tarefas')
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

    async function consultarCidade(cepParam) {
        const cleaned = (cepParam || '').toString().replace(/\D/g, '')
        if (!cleaned || cleaned.length !== 8) return ''

        try {
            const url = `https://viacep.com.br/ws/${cleaned}/json/`
            const { data } = await axios.get(url)
            if (data && data.erro) return ''
            return data.localidade || ''
        } catch (err) {
            console.warn(`Erro ao consultar CEP ${cepParam}:`, err.message)
            return ''
        }
    }

    async function adicionarTarefa({ texto: textoTarefa, prioridade: prioridadeTarefa, cep: cepTarefa }) {
        const cidadeTarefa = await consultarCidade(cepTarefa)

        const novaTarefa = {
            texto: textoTarefa,
            prioridade: prioridadeTarefa,
            concluida: false,
            coluna: colunaAtiva || 'A FAZER',
            cidade: cidadeTarefa || '',
        }

        try {
            const resposta = await api.post('/tarefas', normalizarPayloadTarefa(novaTarefa))
            setTarefas((tarefasAtuais) => [...tarefasAtuais, resposta.data])
            setErroAPI(null)
        } catch (erro) {
            console.error('Erro ao adicionar tarefa:', erro)
            setErroAPI(erro.response?.data?.erro || erro.message || 'Erro ao adicionar tarefa')
        }
    }

    async function atualizarTarefa(id, dadosAtualizados) {
        try {
            const resposta = await api.put(`/tarefas/${id}`, normalizarPayloadTarefa(dadosAtualizados))
            setTarefas((prev) =>
                prev.map((tarefa) => (tarefa.id === id ? resposta.data : tarefa))
            )
            setErroAPI(null)
        } catch (erro) {
            console.error(`Erro ao atualizar a tarefa ${id}:`, erro)
            setErroAPI(erro.response?.data?.erro || erro.message || 'Erro ao atualizar tarefa')
        }
    }

    function atualizarColunaTarefa(id, novaColuna) {
        const estaConcluida = novaColuna === 'CONCLUÍDA'

        atualizarTarefa(id, {
            coluna: novaColuna,
            concluida: estaConcluida,
        })
    }

    function concluirTarefa(id) {
        const tarefa = tarefas.find((t) => t.id === id)

        if (!tarefa) return

        const estaConcluida = tarefa.concluida || tarefa.coluna === 'CONCLUÍDA'
        const novoStatus = !estaConcluida

        atualizarTarefa(id, {
            concluida: novoStatus,
            coluna: novoStatus ? 'CONCLUÍDA' : 'A FAZER',
        })
    }

    async function atualizarPrioridade(id, novaPrioridade) {
        atualizarTarefa(id, { prioridade: novaPrioridade })
    }

    async function excluirTarefa(id) {
        const confirmado = window.confirm('Tem certeza que deseja excluir esta tarefa?')
        if (!confirmado) return

        try {
            await api.delete(`/tarefas/${id}`)
            const resposta = await api.get('/tarefas')
            setTarefas(resposta.data)
            setErroAPI(null)
        } catch (erro) {
            console.error(`Erro ao excluir a tarefa ${id}:`, erro)
            setErroAPI(erro.response?.data?.erro || erro.message || 'Erro ao excluir tarefa')
        }
    }

    const tarefasExibidas = tarefas.map((tarefa) => ({
        ...tarefa,
        coluna: tarefa.coluna || (tarefa.concluida ? 'CONCLUÍDA' : 'A FAZER'),
    }))

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

    if (erroAPI) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#d32f2f' }}>
                <h2>Erro ao carregar tarefas</h2>
                <p>{erroAPI}</p>
                <button onClick={() => window.location.reload()}>Tentar novamente</button>
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
            />
            {modalAberto && (
                <ModalTarefa
                    aberto={modalAberto}
                    onFechar={() => {
                        setModalAberto(false)
                        setTarefaEditando(null)
                        setColunaAtiva(null)
                    }}
                    onSalvar={handleSalvarTarefa}
                    tarefa={tarefaEditando}
                    coluna={colunaAtiva}
                />
            )}
        </>
    )
}
        