import { useState, useEffect, useCallback } from 'react'
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

  useEffect(() => {
    try {
      if (logado) {
        localStorage.setItem('taskflow_token', localStorage.getItem('taskflow_token') || '')
      } else {
        localStorage.removeItem('taskflow_token')
      }
    } catch (e) {
      console.warn('Erro ao salvar no localStorage:', e)
    }
  }, [logado])

  const login = useCallback(() => {
    setLogado(true)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('taskflow_token')
    setLogado(false)
  }, [])

  return (
    <AuthContext.Provider value={{ logado, setLogado, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
