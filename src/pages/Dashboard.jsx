import { useState, useEffect } from 'react'
import axios from 'axios'
import useLocalStorage from '../hooks/useLocalStorage'
import PainelTarefas from '../components/PainelTarefas'
import ModalTarefa from '../components/ModalTarefa'

const STORAGE_KEY = 'tarefas'

export default function Dashboard() {
    const [tarefas, setTarefas] = useLocalStorage(STORAGE_KEY, [])
    const [filtro, setFiltro] = useState('all')
    const [filtroPrioridade, setFiltroPrioridade] = useState('todas')
    const [modalAberto, setModalAberto] = useState(false)
    const [tarefaEditando, setTarefaEditando] = useState(null)
    const [colunaAtiva, setColunaAtiva] = useState('A FAZER')

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

        const novo = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        texto: textoTarefa,
        prioridade: prioridadeTarefa,
        concluida: false,
        coluna: 'A FAZER',
        cep: cepTarefa || '',
        cidade: cidadeTarefa || '',
        }

        setTarefas((prev) => [...prev, novo])
    }

    function atualizarColunaTarefa(id, novaColuna) {
        setTarefas((prev) =>
        prev.map((tarefa) =>
            tarefa.id === id
            ? { ...tarefa, coluna: novaColuna, concluida: novaColuna === 'CONCLUÍDA' }
            : tarefa,
        ),
        )
    }

    function concluirTarefa(id) {
        setTarefas((prev) =>
        prev.map((tarefa) => {
            if (tarefa.id !== id) return tarefa

            const estaConcluida = tarefa.coluna === 'CONCLUÍDA' || tarefa.concluida

            return {
            ...tarefa,
            coluna: estaConcluida ? 'A FAZER' : 'CONCLUÍDA',
            concluida: !estaConcluida,
            }
        }),
        )
    }

    function excluirTarefa(id) {
        

        const confirmado = window.confirm('Tem certeza que deseja excluir esta tarefa?')
        if (confirmado){
            setTarefas((prev) => prev.filter((tarefa) => tarefa.id !== id))
        };
    }

    function atualizarPrioridade(id, novaPrioridade) {
        setTarefas((prev) =>
        prev.map((tarefa) => (tarefa.id === id ? { ...tarefa, prioridade: novaPrioridade } : tarefa)),
        )
    }

    const tarefasExibidas = tarefas.map((tarefa) => ({
        ...tarefa,
        coluna: tarefa.coluna || (tarefa.concluida ? 'CONCLUÍDA' : 'A FAZER'),
    }))

    function handleSalvarTarefa(dadosTarefa) {
        if (dadosTarefa.id) {
            // Editar
            setTarefas((prev) =>
                prev.map((tarefa) =>
                    tarefa.id === dadosTarefa.id
                        ? { ...tarefa, ...dadosTarefa }
                        : tarefa
                )
            )
        } else {
            // Criar
            adicionarTarefa(dadosTarefa)
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
        