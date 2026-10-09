import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login'
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (isLogin) await login(form.email, form.password)
      else await register(form)
      navigate(location.state?.from || '/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth-intro">
        <h1>{isLogin ? 'Welcome back' : 'Plan work your team can see'}</h1>
        <p className="muted">
          {isLogin
            ? 'Log in to see your projects and tasks.'
            : 'Create projects, invite your team and move tasks from To do to Done.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card form">
        {!isLogin && (
          <label className="field">
            <span>Name</span>
            <input required value={form.name} onChange={update('name')} autoComplete="name" />
          </label>
        )}
        <label className="field">
          <span>Email</span>
          <input type="email" required value={form.email} onChange={update('email')} autoComplete="email" />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={update('password')}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />
        </label>
        {error && <p className="alert">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
        </button>
        {isLogin && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setForm({ ...form, email: 'demo@taskflow.dev', password: 'demo123' })}
          >
            Use demo account
          </button>
        )}
        <p className="muted small center">
          {isLogin ? (
            <>No account? <Link to="/register">Sign up</Link></>
          ) : (
            <>Already have an account? <Link to="/login">Log in</Link></>
          )}
        </p>
      </form>
    </div>
  )
}
