import './App.css'

// Components
import Header from './components/Header'
import Footer from './components/Footer'
import Sidebar from './components/SideBar'

// Routes
import AppRoutes from './routes/AppRoutes'
import { useAuth } from './context/useAuthHook'
import { useState } from 'react'

function App() {
  const { logado } = useAuth()
  const [sidebarAberta, setSidebarAberta] = useState(true)

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
            {sidebarAberta ? '☰' : '☰'}
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
