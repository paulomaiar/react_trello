import { useState, useEffect, useCallback } from 'react'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
  const [logado, setLogado] = useState(() => {
    // Tenta recuperar do localStorage na primeira renderização
    try {
      const valor = localStorage.getItem('logado')
      return valor === 'true'
    } catch (e) {
      console.warn('localStorage não disponível:', e)
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('logado', logado)
    } catch (e) {
      console.warn('Erro ao salvar no localStorage:', e)
    }
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
