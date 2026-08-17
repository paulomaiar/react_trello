import styles from './ItemTarefas.module.css'
import PrioridadeTarefa from './PrioridadeTarefa'

export default function ItemTarefa({ tarefas = [], onConcluir, onExcluir, onAtualizarPrioridade, onAtualizarColuna, onEditar }) {


    return (
        <>
            {tarefas.map((tarefa) => {
                const prioridadeClassName = tarefa.prioridade === 'alta'
                    ? styles.prioridadeAlta
                    : tarefa.prioridade === 'media'
                        ? styles.prioridadeMedia
                        : styles.prioridadeBaixa

                const itemClassName = [
                    styles.item,
                    tarefa.concluida || tarefa.coluna === 'CONCLUÍDA' ? styles.itemCompleted : '',
                    prioridadeClassName,
                ]
                    .filter(Boolean)
                    .join(' ')

                const textClassName = `${styles.text} ${tarefa.concluida || tarefa.coluna === 'CONCLUÍDA' ? styles.completedText : ''}`

                return (
                    <li key={tarefa.id} className={itemClassName} onDoubleClick={() => onEditar?.(tarefa)}>
                        <div className={styles.content}>
                            <span className={textClassName}>{tarefa.texto}</span>
                            {tarefa.cidade || tarefa.cep ? (
                                <div className={styles.meta}>
                                    {tarefa.cep ? <small>CEP: {tarefa.cep}</small> : null}
                                    {tarefa.cidade ? <small> — Cidade: {tarefa.cidade}</small> : null}
                                </div>
                            ) : null}
                        </div>
                        <div className={styles.actions}>
                            <label className="prioridade-label">
                                <span className="prioridade-label-text">Status</span>
                                <select
                                    className="status-select"
                                    value={tarefa.coluna || 'A FAZER'}
                                    onChange={(event) => onAtualizarColuna?.(tarefa.id, event.target.value)}
                                >
                                    <option value="A FAZER">A fazer</option>
                                    <option value="EM ANDAMENTO">Em andamento</option>
                                    <option value="CONCLUÍDA">Concluída</option>
                                </select>
                            </label>
                            <PrioridadeTarefa
                                prioridade={tarefa.prioridade}
                                setPrioridade={(novaPrioridade) => onAtualizarPrioridade?.(tarefa.id, novaPrioridade)}
                                label=""
                            />
                            <button type="button" className={`${styles.button} ${styles.primary}`} onClick={() => onEditar?.(tarefa)}>
                                ✏️ Editar
                            </button>
                            <button type="button" className={`${styles.button} ${styles.primary}`} onClick={() => onConcluir?.(tarefa.id)}>
                                {tarefa.concluida || tarefa.coluna === 'CONCLUÍDA' ? 'Reabrir' : 'Concluir'}
                            </button>
                            <button type="button" className={`${styles.button} ${styles.danger}`} onClick={() => onExcluir?.(tarefa.id)}>
                                Excluir
                            </button>
                        </div>
                    </li>
                )
            })}
        </>
    )
}
