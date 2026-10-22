import styles from './PrioridadeTarefa.module.css'

export default function PrioridadeTarefa({ prioridade, setPrioridade, prioridades = [], label = '', disabled = false }) {
    return (
        <label className={styles.label}>
            {label ? <span className={styles.text}>{label}</span> : null}
            <select value={prioridade} onChange={(event) => setPrioridade(event.target.value)} className={styles.select} disabled={disabled}>
                {prioridades.map((item) => (
                    <option key={item.id} value={item.id}>{item.descricao}</option>
                ))}
            </select>
        </label>
    )
}