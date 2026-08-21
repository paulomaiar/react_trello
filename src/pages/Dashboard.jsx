import { useState, useEffect } from 'react'
import axios from 'axios'
import PainelTarefas from '../components/PainelTarefas'
import ModalTarefa from '../components/ModalTarefa'

const API_URL = import.meta.env.VITE_API_URL


export default function Dashboard() {
    const [tarefas, setTarefas] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [filtro, setFiltro] = useState('all')
    const [filtroPrioridade, setFiltroPrioridade] = useState('todas')
    const [modalAberto, setModalAberto] = useState(false)
    const [tarefaEditando, setTarefaEditando] = useState(null)
    const [colunaAtiva, setColunaAtiva] = useState('A FAZER')

    useEffect(() => {
        async function carregarTarefas() {
            try {
                // Dispara a requisição GET para o endpoint
                const resposta = await axios.get(API_URL)
            
                // O axios coloca os dados vindos em formato JSON dentro da propriedade .data
                setTarefas(resposta.data)
            } catch (erro) {
                console.error("Erro ao buscar dados do servidor:", erro)
            } finally {
                // Desativa o aviso de "Carregando..."
                setCarregando(false)
            }
        }

        carregarTarefas()
    }, []) // Array vazio = roda 1 vez ao carregar o componente

    useEffect(() => {
        const pendentes = tarefas.filter((tarefa) => !(tarefa.concluida || tarefa.coluna === 'CONCLUÍDA')).length
        document.title = pendentes > 0 ? `(${pendentes}) TaskFlow` : 'TaskFlow'

        return () => {
            document.title = 'TaskFlow'
        }
    }, [tarefas])

    // ✅ ABRE MODAL PARA CRIAR NOVA TAREFA
    function abrirModalCriar(coluna = 'A FAZER') {
        setTarefaEditando(null)  // null = modo criação
        setColunaAtiva(coluna)
        setModalAberto(true)
    }

    // ✅ ABRE MODAL PARA EDITAR TAREFA EXISTENTE
    function abrirModalEditar(tarefa) {
        setTarefaEditando(tarefa)  // Preenche com dados existentes
        setModalAberto(true)
    }

    async function consultarCidade(cepParam) {
        const cleaned = (cepParam || '').toString().replace(/\D/g, '')
        // CEP brasileiro tem 8 dígitos
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
            const resposta = await axios.post(API_URL, novaTarefa)

            const tarefaSalva = resposta.data

            setTarefas((tarefasAtuais) => [...tarefasAtuais, tarefaSalva])
        } catch (erro) {
            console.error('Erro ao adicionar tarefa:', erro)
        }
    }

    async function atualizarTarefa(id, dadosAtualizados) {
        try{
            // Fazemos o PUT/PATCH enviando apenas os campos alterados
            const { data: tarefaAtualizada } = await axios.put(`${API_URL}/${id}`, dadosAtualizados)

            setTarefas((prev) => 
                prev.map((tarefa) => (tarefa.id === id ? tarefaAtualizada : tarefa))
            )
        }   catch (erro) {
            console.error(`Erro ao atualizar a tarefa ${id}:`, erro)
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

        //verifica o estado atual
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
            await axios.delete(`${API_URL}/${id}`)

            // se o servidor apagou com sucesso, removemos da tela no react
            setTarefas((prev) => prev.filter((tarefa) => tarefa.id !== id))
        }   catch(erro) {
            console.erro(`Erro ao excluir a tarefa ${id}:`, erro)
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

    return(
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
        