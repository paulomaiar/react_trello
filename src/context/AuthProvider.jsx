import { useState, useEffect, useCallback } from 'react'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
  const [logado, setLogado] = useState(() => {
    // Tenta recuperar do localStorage na primeira renderização
    return localStorage.getItem('logado') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('logado', logado)
  }, [logado])

  // Função de login — chama setLogado(true)
  const login = useCallback(() => { 
    setLogado(true)
  }, [])

  // Função de logout — chama setLogado(false)
  const logout = useCallback(() => { 
    setLogado(false)
  }, [])

  return (
    <AuthContext.Provider value={{ logado, setLogado, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
