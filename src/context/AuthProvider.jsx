import { useState, useCallback } from 'react'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
  const [logado, setLogado] = useState(() => {
    try {
      const valor = localStorage.getItem('taskflow_token')
      return Boolean(valor)
    } catch (e) {
      console.warn('localStorage não disponível:', e)
      return false
    }
  })

  const [usuario, setUsuario] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('taskflow_usuario') || 'null')
    } catch (e) {
      console.warn('localStorage não disponível:', e)
      return null
    }
  })

  const login = useCallback((novoUsuario, token) => {
    if (!token) return

    try {
      localStorage.setItem('taskflow_token', token)
      localStorage.setItem('taskflow_usuario', JSON.stringify(novoUsuario))
      setUsuario(novoUsuario)
      setLogado(true)
    } catch (e) {
      console.warn('Erro ao salvar a sessão:', e)
    }
  }, [])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('taskflow_token')
      localStorage.removeItem('taskflow_usuario')
    } catch (e) {
      console.warn('Erro ao remover a sessão:', e)
    }
    setUsuario(null)
    setLogado(false)
  }, [])

  return (
    <AuthContext.Provider value={{ logado, usuario, setLogado, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
