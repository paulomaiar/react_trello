import { Link } from 'react-router-dom'
import styles from './Header.module.css'
import { useAuth } from '../context/useAuthHook'

export default function Header({ titulo, subtitulo }) {
    const { logado } = useAuth()

    return (
        <header className={styles.siteHeader}>
            <div className={styles.brand}>
                <h1>{titulo}</h1>
                <p>{subtitulo}</p>
            </div>
            <nav className={styles.nav} aria-label="Navegação principal">
                {logado && <Link to="/dashboard" className={styles.link}>Tarefas</Link>}
                <Link to="/sobre" className={styles.link}>Sobre</Link>
                {logado ? (
                    <Link to="/logout" className={styles.link}>Sair</Link>
                ) : (
                    <Link to="/login" className={styles.link}>Login</Link>
                )}
            </nav>
        </header>
    )
}