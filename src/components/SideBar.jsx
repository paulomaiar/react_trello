import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/useAuthHook';
import styles from './Sidebar.module.css';

function Sidebar({ aberta = true }) {
    const { logado } = useAuth();

    if (!aberta) {
        return null;
    }

    const linkClass = ({ isActive }) =>
    isActive ? styles.link + ' ' + styles.ativo : styles.link;

    return (

        <aside className={styles.sidebar}>

            <div className={styles.logo}>

            <h1>TaskFlow</h1>

            </div>

            <nav className={styles.nav}>

                {logado && <NavLink to='/dashboard' className={linkClass}>Dashboard</NavLink>}

                <NavLink to='/sobre' className={linkClass}>Sobre</NavLink>

            </nav>

        </aside>

    );

}

export default Sidebar;