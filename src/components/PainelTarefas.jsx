import AdicionarTarefa from './AdicionarTarefa'
import TarefasCadastradas from './TarefasCadastradas'

export default function PainelTarefas({
    sectionHeader,
    tarefas,
    filtro,
    filtroPrioridade,
    onAdicionar,
    onEditar,
    onConcluir,
    onExcluir,
    onAtualizarPrioridade,
    onAtualizarColuna,
    onFiltroPrioridadeChange,
}) {
    return (
        <section className="painel-tarefas" aria-labelledby="tarefas-title" id="tarefas">
            <header className="section-header">
                <h2 id="tarefas-title">{sectionHeader}</h2>
            </header>

            <AdicionarTarefa
                onAdicionar={() => onAdicionar?.('A FAZER')}
            />

            <TarefasCadastradas
                tarefas={tarefas}
                filtro={filtro}
                filtroPrioridade={filtroPrioridade}
                onFiltroPrioridadeChange={onFiltroPrioridadeChange}
                onEditar={onEditar}
                onConcluir={onConcluir}
                onExcluir={onExcluir}
                onAtualizarPrioridade={onAtualizarPrioridade}
                onAtualizarColuna={onAtualizarColuna}
                onAdicionar={onAdicionar}
            />
        </section>
    )
}