import styles from './AdicionarTarefa.module.css'

export default function AdicionarTarefa({
    onAdicionar,
}) {
    return (
        <section id="adicionar-tarefa" className={styles.root} aria-labelledby="adicionar-titulo">
            <h3 id="adicionar-titulo" className={styles.title}>Adicionar nova tarefa</h3>
            <button 
                className={styles.button} 
                onClick={onAdicionar}
                type="button"
            >
                ➕ Adicionar Tarefa
            </button>
        </section>
    )
}


