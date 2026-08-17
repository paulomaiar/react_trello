import { Navigate, Routes, Route } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import Sobre from '../pages/Sobre'
import Login from '../pages/Login'
import Logout from '../pages/Logout'
import RotaPrivada from '../components/RotaPrivada'
import { useAuth } from '../context/useAuthHook'

function RootRoute() {
  const { logado } = useAuth()
  return logado ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/dashboard" element={<RotaPrivada><Dashboard /></RotaPrivada>} />
      <Route path="/login" element={<Login />} />
      <Route path="/sobre" element={<Sobre />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes