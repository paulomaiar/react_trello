import './App.css'
import { useState, useEffect } from 'react'

// Components
import Header from './components/Header'
import Footer from './components/Footer'
import Sidebar from './components/SideBar'

// Routes
import AppRoutes from './routes/AppRoutes'
import { useAuth } from './context/useAuthHook'

function App() {
  const { logado } = useAuth()
  const [sidebarAberta, setSidebarAberta] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    // Captura erros silenciosos
    const handleError = (event) => {
      console.error('Erro capturado:', event.error)
      setErro(event.error?.message || 'Erro desconhecido')
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (erro) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h1>Erro ao carregar a aplicação</h1>
        <p style={{ color: '#666' }}>{erro}</p>
        <button onClick={() => window.location.reload()}>Recarregar</button>
      </div>
    )
  }

  return (
    <div className="page-shell">
      {logado && (
        <>
          <button
            type="button"
            className={`sidebar-toggle ${sidebarAberta ? 'is-open' : 'is-closed'}`}
            onClick={() => setSidebarAberta((estado) => !estado)}
            aria-label={sidebarAberta ? 'Fechar sidebar' : 'Abrir sidebar'}
            title={sidebarAberta ? 'Fechar sidebar' : 'Abrir sidebar'}
          >
            {sidebarAberta ? '✕' : '☰'}
          </button>
          <Sidebar aberta={sidebarAberta} />
        </>
      )}

      <div className="main-content">
        <Header titulo="TaskFlow" subtitulo="Gerencie suas tarefas com mais organização." />

        <main id="app">
          <AppRoutes />
        </main>

        <Footer />
      </div>
    </div>
  )
}

export default App
