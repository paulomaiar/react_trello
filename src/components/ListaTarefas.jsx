import ItemTarefa from './ItemTarefas'
import styles from './ItemTarefas.module.css'

export default function ListaTarefas({ tarefas, onConcluir, onExcluir, onAtualizarPrioridade, onAtualizarColuna, onEditar, coluna }) {
    const total = tarefas.length
    const pendentes = tarefas.filter((tarefa) => !(tarefa.concluida || tarefa.coluna === 'CONCLUÍDA')).length
    const concluidas = total - pendentes

    return (
        <>
            <div className="contadores" aria-live="polite">
                <span id="contador-total">Total: {total}</span>
                <span id="contador-pendentes">Pendentes: {pendentes}</span>
                <span id="contador-concluidas">Concluídas: {concluidas}</span>
            </div>
            <ul id={`lista-tarefas-${coluna?.toLowerCase().replace(/\s+/g, '-')}`} className={styles.list}>
                <ItemTarefa
                    tarefas={tarefas}
                    onConcluir={onConcluir}
                    onExcluir={onExcluir}
                    onAtualizarPrioridade={onAtualizarPrioridade}
                    onAtualizarColuna={onAtualizarColuna}
                    onEditar={onEditar}
                />
            </ul>
        </>
    )
}


