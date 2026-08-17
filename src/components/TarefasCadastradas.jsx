import Coluna from './Coluna'
import styles from './TarefasCadastradas.module.css'

const COLUNAS = [
    { key: 'A FAZER', title: 'A fazer' },
    { key: 'EM ANDAMENTO', title: 'Em andamento' },
    { key: 'CONCLUÍDA', title: 'Concluída' },
]

export default function TarefasCadastradas({
    tarefas = [],
    filtro,
    filtroPrioridade,
    onFiltroPrioridadeChange,
    onConcluir,
    onExcluir,
    onAtualizarPrioridade,
    onAtualizarColuna,
    onEditar,
    onAdicionar,
}) {

    const total = tarefas.length
    const pendentes = tarefas.filter((tarefa) => !(tarefa.concluida || tarefa.coluna === 'CONCLUÍDA')).length
    const concluidas = total - pendentes
    
    // Filtro duplo: status E prioridade
    const listaFiltrada = tarefas.filter((tarefa) => {
        // Filtro de STATUS (coluna)
        const coluna = tarefa.coluna || (tarefa.concluida ? 'CONCLUÍDA' : 'A FAZER')
        const passouFiltroStatus = 
            filtro === 'all' ? true :
            filtro === 'pendentes' ? coluna !== 'CONCLUÍDA' :
            coluna === 'CONCLUÍDA'
        
        // Filtro de PRIORIDADE
        const passouFiltroPrioridade = 
            filtroPrioridade === 'todas' ? true :
            tarefa.prioridade === filtroPrioridade
        
        // AMBOS precisam passar
        return passouFiltroStatus && passouFiltroPrioridade
    })

    

    return (
        <section id="lista-tarefas-section" aria-labelledby="lista-titulo">
            <div className="section-header filtros-container">
                <h3 id="lista-titulo">Tarefas cadastradas</h3>
                <div className="contadores" aria-live="polite">
                    <span id="contador-total">Total: {total}</span>
                    <span id="contador-pendentes">Pendentes: {pendentes}</span>
                    <span id="contador-concluidas">Concluídas: {concluidas}</span>
                </div>
            </div>

            {/* FILTRO DE PRIORIDADE */}
            <div className={styles.filtroPrioridadeContainer}>
                <label htmlFor="filtro-prioridade">
                    Filtrar por prioridade:
                </label>
                <select 
                    id="filtro-prioridade"
                    value={filtroPrioridade} 
                    onChange={(e) => onFiltroPrioridadeChange(e.target.value)}
                >
                    <option value="todas">Todas</option>
                    <option value="alta">🔴 Alta</option>
                    <option value="media">🟡 Média</option>
                    <option value="baixa">🟢 Baixa</option>
                </select>
            </div>

            <div className="board">
                {COLUNAS.map((coluna) => {
                    const tarefasDaColuna = listaFiltrada.filter((tarefa) => {
                        const colunaTarefa = tarefa.coluna || (tarefa.concluida ? 'CONCLUÍDA' : 'A FAZER')
                        return colunaTarefa === coluna.key
                    })

                    return (
                        <Coluna
                            key={coluna.key}
                            title={coluna.title}
                            className="coluna"
                            coluna={coluna.key}
                            tarefas={tarefasDaColuna}
                            onConcluir={onConcluir}
                            onExcluir={onExcluir}
                            onAtualizarPrioridade={onAtualizarPrioridade}
                            onAtualizarColuna={onAtualizarColuna}
                            onEditar={onEditar}
                            onAdicionar={onAdicionar}
                        />
                    )
                })}
            </div>
        </section>
    )
}

