import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuthHook'
import styles from './Logout.module.css'

export default function Logout() {
    const navigate = useNavigate()
    const { logout } = useAuth()

    useEffect(() => {
        const handleLogout = async () => {
            logout()
            navigate('/login', { replace: true })
        }
        handleLogout()
    }, [logout, navigate])

    return (
        <div className={styles.logoutContainer}>
            <p>Saindo...</p>
        </div>
    )
}