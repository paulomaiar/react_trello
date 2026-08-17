import { useContext } from 'react'
import { AuthContext } from './AuthContext'

export function useAuth() {
  const context = useContext(AuthContext)

  // Erro claro se usado fora do AuthProvider
  if (!context) {
    throw new Error('useAuth deve ser usado dentro do AuthProvider')
  }

  return context // { logado, setLogado, login, logout }
}
