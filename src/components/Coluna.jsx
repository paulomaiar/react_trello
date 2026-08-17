import ListaTarefas from './ListaTarefas'

export default function Coluna({
    title,
    className,
    tarefas,
    coluna,
    onConcluir,
    onExcluir,
    onAtualizarPrioridade,
    onAtualizarColuna,
    onEditar,
    onAdicionar,
}) {
    return (
        <section className={className}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <h3>{title}</h3>
                <button
                    type="button"
                    onClick={() => onAdicionar?.(coluna)}
                    aria-label={`Adicionar tarefa em ${title}`}
                    style={{ cursor: 'pointer', fontSize: '1.1rem', border: 'none', background: 'transparent', color: '#38BDF8' }}
                >
                    +
                </button>
            </div>
            <ListaTarefas
                tarefas={tarefas}
                coluna={coluna}
                onConcluir={onConcluir}
                onExcluir={onExcluir}
                onAtualizarPrioridade={onAtualizarPrioridade}
                onAtualizarColuna={onAtualizarColuna}
                onEditar={onEditar}
            />
        </section>
    )
}