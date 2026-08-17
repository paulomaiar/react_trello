import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuthHook'

export default function RotaPrivada({ children }) {
  const { logado } = useAuth()

  if (!logado) {
    return <Navigate to='/login' replace />
  }

  return children
}