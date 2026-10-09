import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { dueLabel, PROJECT_COLORS } from '../utils'

function NewProjectForm({ onCreated, onCancel }) {
  const [form, setForm] = useState({ name: '', description: '', color: PROJECT_COLORS[0] })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api('/projects', { method: 'POST', body: form })
      onCreated()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form className="card form new-project" onSubmit={handleSubmit}>
      <label className="field">
        <span>Project name</span>
        <input required autoFocus maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </label>
      <label className="field">
        <span>Description (optional)</span>
        <input maxLength={500} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </label>
      <div className="field">
        <span>Colour</span>
        <div className="swatches">
          {PROJECT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`swatch${form.color === c ? ' active' : ''}`}
              style={{ background: c }}
              aria-label={`Colour ${c}`}
              onClick={() => setForm({ ...form, color: c })}
            />
          ))}
        </div>
      </div>
      {error && <p className="alert">{error}</p>}
      <div className="row">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">Create project</button>
      </div>
    </form>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState(null)
  const [myTasks, setMyTasks] = useState([])
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    Promise.all([api('/projects'), api('/tasks/mine')])
      .then(([p, t]) => {
        setProjects(p.projects)
        setMyTasks(t.tasks)
      })
      .catch((err) => setError(err.message))
  }, [])

  useEffect(load, [load])

  const overdue = myTasks.filter((t) => dueLabel(t.dueDate)?.tone === 'danger').length

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Hi {user.name.split(' ')[0]} 👋</h1>
          <p className="muted">
            You have {myTasks.length} open {myTasks.length === 1 ? 'task' : 'tasks'}
            {overdue > 0 && <>, <span className="danger">{overdue} overdue</span></>}.
          </p>
        </div>
        {!creating && (
          <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>+ New project</button>
        )}
      </div>

      {error && <p className="alert">{error}</p>}
      {creating && <NewProjectForm onCancel={() => setCreating(false)} onCreated={() => { setCreating(false); load() }} />}

      <div className="dashboard">
        <section>
          <h2>Projects</h2>
          {!projects ? (
            <p className="muted">Loading…</p>
          ) : projects.length === 0 ? (
            <div className="empty card">No projects yet. Create one to get started.</div>
          ) : (
            <div className="project-grid">
              {projects.map((p) => {
                const total = p.taskCounts.todo + p.taskCounts.in_progress + p.taskCounts.done
                const pct = total ? Math.round((p.taskCounts.done / total) * 100) : 0
                return (
                  <Link key={p._id} to={`/projects/${p._id}`} className="card project-card" style={{ '--project': p.color }}>
                    <h3>{p.name}</h3>
                    {p.description && <p className="muted small clamp">{p.description}</p>}
                    <div className="progress" aria-label={`${pct}% done`}><span style={{ width: `${pct}%` }} /></div>
                    <p className="muted small">
                      {p.taskCounts.done}/{total} done · {p.memberCount} {p.memberCount === 1 ? 'member' : 'members'}
                    </p>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        <aside>
          <h2>Assigned to me</h2>
          {myTasks.length === 0 ? (
            <div className="empty card">Nothing assigned to you. 🎉</div>
          ) : (
            <ul className="my-tasks card">
              {myTasks.map((t) => {
                const due = dueLabel(t.dueDate)
                return (
                  <li key={t._id}>
                    <Link to={`/projects/${t.project._id}`}>
                      <span className="dot" style={{ background: t.project.color }} />
                      <span className="grow">
                        {t.title}
                        <span className="muted small block">{t.project.name}</span>
                      </span>
                      {due && <span className={`chip ${due.tone}`}>{due.text}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </aside>
      </div>
    </>
  )
}
