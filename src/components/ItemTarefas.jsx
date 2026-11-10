import styles from './ItemTarefas.module.css'
import PrioridadeTarefa from './PrioridadeTarefa'
import { useAuth } from '../context/useAuthHook'

export default function ItemTarefa({
    tarefas = [],
    rotuloPrioridade,
    classePrioridade,
    prioridades = [],
    onConcluir,
    onExcluir,
    onAtualizarPrioridade,
    onAtualizarColuna,
    onEditar,
}) {
    const { usuario } = useAuth()

    return (
        <>
            {tarefas.map((tarefa) => {
                const ehCriador = Number(tarefa.criadoPorId ?? tarefa.criado_por_id) === Number(usuario?.id)
                const prioridadeClassName = Number(tarefa.idprioridade) === 3 || tarefa.prioridade === 'alta'
                    ? styles.prioridadeAlta
                    : Number(tarefa.idprioridade) === 2 || tarefa.prioridade === 'media'
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
                    <li
                        key={tarefa.id}
                        className={itemClassName}
                        style={{ '--cor-prioridade': tarefa.prioridade_cor || undefined }}
                        onDoubleClick={() => onEditar?.(tarefa)}
                    >
                        <div className={styles.content}>
                            <span className={textClassName}>{tarefa.texto}</span>
                            <span className={`${styles.badge} ${styles[classePrioridade] || ''}`}>
                                {rotuloPrioridade || tarefa.prioridade}
                            </span>
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
                                prioridade={tarefa.idprioridade}
                                prioridades={prioridades}
                                setPrioridade={(novaPrioridade) => onAtualizarPrioridade?.(tarefa.id, novaPrioridade)}
                                label=""
                                disabled={!ehCriador}
                            />
                            <button type="button" className={`${styles.button} ${styles.primary}`} onClick={() => onEditar?.(tarefa)}>
                                ✏️ Editar
                            </button>
                            <button type="button" className={`${styles.button} ${styles.primary}`} onClick={() => onConcluir?.(tarefa.id)}>
                                {tarefa.concluida || tarefa.coluna === 'CONCLUÍDA' ? 'Reabrir' : 'Concluir'}
                            </button>
                            {ehCriador && (
                                <button type="button" className={`${styles.button} ${styles.danger}`} onClick={() => onExcluir?.(tarefa.id)}>
                                    Excluir
                                </button>
                            )}
                        </div>
                    </li>
                )
            })}
        </>
    )
}
