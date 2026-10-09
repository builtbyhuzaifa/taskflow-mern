import { Link, Navigate, Route, Routes, useNavigate } from 'react-router'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import ProjectBoard from './pages/ProjectBoard'

function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <img src="/favicon.svg" alt="" width="28" height="28" />
          TaskFlow
        </Link>
        {user && (
          <div className="header-user">
            <span className="avatar" title={user.email}>{user.name[0]}</span>
            <span className="hide-sm">{user.name}</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate('/login') }}>
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  return (
    <>
      <Header />
      <main className="container page">
        <Routes>
          <Route path="/login" element={!loading && user ? <Navigate to="/" replace /> : <AuthPage mode="login" />} />
          <Route path="/register" element={!loading && user ? <Navigate to="/" replace /> : <AuthPage mode="register" />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectBoard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  )
}
