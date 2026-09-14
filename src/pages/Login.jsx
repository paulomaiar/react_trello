import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuthHook'
import { loginNoBackend } from '../services/api'
import './Login.css'

export default function Login() {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [shake, setShake] = useState(false)
  const [carregando, setCarregando] = useState(false)

  const { login, logado } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (logado) {
      navigate('/dashboard', { replace: true })
    }
  }, [logado, navigate])

  async function handleLogin() {
    if (!usuario.trim() || !senha.trim()) {
      setErro('Informe usuário e senha')
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }

    try {
      setCarregando(true)
      setErro('')

      await loginNoBackend({ usuario: usuario.trim(), senha: senha.trim() })
      login()
      navigate('/dashboard')
    } catch (error) {
      const mensagem = error?.response?.data?.message || 'Usuário ou senha incorretos'
      setErro(mensagem)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className='login-container'>
      <div className={`login-card ${shake ? 'shake' : ''}`}>
        <h1 className='login-logo'>TaskFlow</h1>
        <p className='login-subtitulo'>Faça login para continuar</p>

        <input
          className='login-input'
          type='text'
          placeholder='Usuário'
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />

        <input
          className='login-input'
          type='password'
          placeholder='Senha'
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />

        {erro && <p className='login-erro'>{erro}</p>}

        <button className='login-btn' onClick={handleLogin} disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>

        <p className='login-aviso'>
          Este login usa o backend em Node. Ajuste as credenciais conforme o servidor.
        </p>
      </div>
    </div>
  )
}

