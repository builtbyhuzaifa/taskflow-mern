import { useEffect, useState } from 'react'
import { api } from '../api'
import { COLUMNS, toDateInput } from '../utils'

export default function TaskModal({ task, defaultStatus, project, people, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || defaultStatus || 'todo',
    priority: task?.priority || 'medium',
    dueDate: toDateInput(task?.dueDate),
    assignee: task?.assignee?._id || '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (task) await api(`/tasks/${task._id}`, { method: 'PATCH', body: form })
      else await api(`/projects/${project._id}/tasks`, { method: 'POST', body: form })
      onSaved()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return
    try {
      await api(`/tasks/${task._id}`, { method: 'DELETE' })
      onSaved()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal card form" onSubmit={handleSubmit} role="dialog" aria-modal="true" aria-label={task ? 'Edit task' : 'New task'}>
        <h2>{task ? 'Edit task' : 'New task'}</h2>
        <label className="field">
          <span>Title</span>
          <input required autoFocus maxLength={140} value={form.title} onChange={update('title')} />
        </label>
        <label className="field">
          <span>Description</span>
          <textarea rows={3} maxLength={2000} value={form.description} onChange={update('description')} />
        </label>
        <div className="grid-2">
          <label className="field">
            <span>Status</span>
            <select value={form.status} onChange={update('status')}>
              {COLUMNS.map((c) => <option key={c.status} value={c.status}>{c.label}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Priority</span>
            <select value={form.priority} onChange={update('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="field">
            <span>Due date</span>
            <input type="date" value={form.dueDate} onChange={update('dueDate')} />
          </label>
          <label className="field">
            <span>Assignee</span>
            <select value={form.assignee} onChange={update('assignee')}>
              <option value="">Unassigned</option>
              {people.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </label>
        </div>
        {error && <p className="alert">{error}</p>}
        <div className="row">
          {task && <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>}
          <span className="grow" />
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={busy}>{task ? 'Save' : 'Add task'}</button>
        </div>
      </form>
    </div>
  )
}
