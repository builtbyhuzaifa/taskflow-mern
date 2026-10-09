import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import TaskModal from '../components/TaskModal'
import { COLUMNS, dueLabel } from '../utils'

function TaskCard({ task, onOpen, onDragStart }) {
  const due = dueLabel(task.dueDate)
  return (
    <li
      className="task"
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onOpen(task)}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(task)}
      tabIndex={0}
    >
      <p className="task-title">{task.title}</p>
      <div className="task-meta">
        <span className={`priority priority-${task.priority}`}>{task.priority}</span>
        {due && task.status !== 'done' && <span className={`chip ${due.tone}`}>{due.text}</span>}
        <span className="grow" />
        {task.assignee && <span className="avatar avatar-sm" title={task.assignee.name}>{task.assignee.name[0]}</span>}
      </div>
    </li>
  )
}

function MembersPanel({ project, isOwner, onChange }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const invite = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api(`/projects/${project._id}/members`, { method: 'POST', body: { email } })
      setEmail('')
      onChange()
    } catch (err) {
      setError(err.message)
    }
  }

  const remove = async (member) => {
    if (!window.confirm(`Remove ${member.name} from this project?`)) return
    try {
      await api(`/projects/${project._id}/members/${member._id}`, { method: 'DELETE' })
      onChange()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="card members">
      <h3>Team</h3>
      <ul>
        <li><span className="avatar avatar-sm">{project.owner.name[0]}</span> {project.owner.name} <span className="muted small">owner</span></li>
        {project.members.map((m) => (
          <li key={m._id}>
            <span className="avatar avatar-sm">{m.name[0]}</span> {m.name}
            {isOwner && <button type="button" className="link-btn" onClick={() => remove(m)}>Remove</button>}
          </li>
        ))}
      </ul>
      {isOwner && (
        <form onSubmit={invite} className="invite">
          <input type="email" required placeholder="Teammate's email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" className="btn btn-ghost btn-sm">Add</button>
        </form>
      )}
      {error && <p className="alert small">{error}</p>}
    </div>
  )
}

export default function ProjectBoard() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [modal, setModal] = useState(null) // { task } or { status }
  const [dragOver, setDragOver] = useState(null)
  const [showTeam, setShowTeam] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    Promise.all([api(`/projects/${id}`), api(`/projects/${id}/tasks`)])
      .then(([p, t]) => {
        setProject(p.project)
        setTasks(t.tasks)
      })
      .catch((err) => setError(err.message))
  }, [id])

  useEffect(load, [load])

  const closeModal = useCallback(() => setModal(null), [])

  if (error && !project) return <p className="alert">{error}</p>
  if (!project) return <p className="muted">Loading…</p>

  const isOwner = project.owner._id === user._id
  const people = [project.owner, ...project.members]

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('text/plain', task._id)
    e.dataTransfer.effectAllowed = 'move'
  }

  // Move the card immediately, then save; put it back if the save fails.
  const handleDrop = async (e, status) => {
    e.preventDefault()
    setDragOver(null)
    const taskId = e.dataTransfer.getData('text/plain')
    const task = tasks.find((t) => t._id === taskId)
    if (!task || task.status === status) return

    const previous = tasks
    setTasks(tasks.map((t) => (t._id === taskId ? { ...t, status } : t)))
    try {
      await api(`/tasks/${taskId}`, { method: 'PATCH', body: { status } })
    } catch (err) {
      setTasks(previous)
      setError(err.message)
    }
  }

  const deleteProject = async () => {
    if (!window.confirm(`Delete "${project.name}" and all its tasks? This cannot be undone.`)) return
    try {
      await api(`/projects/${project._id}`, { method: 'DELETE' })
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <Link to="/" className="back">← All projects</Link>
      <div className="page-head">
        <div>
          <h1><span className="dot dot-lg" style={{ background: project.color }} />{project.name}</h1>
          {project.description && <p className="muted">{project.description}</p>}
        </div>
        <div className="row">
          <button type="button" className="btn btn-ghost" onClick={() => setShowTeam(!showTeam)}>
            Team ({people.length})
          </button>
          {isOwner && <button type="button" className="btn btn-ghost" onClick={deleteProject}>Delete</button>}
          <button type="button" className="btn btn-primary" onClick={() => setModal({ status: 'todo' })}>+ Task</button>
        </div>
      </div>

      {error && <p className="alert">{error}</p>}
      {showTeam && <MembersPanel project={project} isOwner={isOwner} onChange={load} />}

      <div className="board">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.status)
          return (
            <section
              key={col.status}
              className={`column${dragOver === col.status ? ' drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col.status) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, col.status)}
            >
              <header className="column-head">
                <h2>{col.label}</h2>
                <span className="count">{columnTasks.length}</span>
              </header>
              <ul className="task-list">
                {columnTasks.map((t) => (
                  <TaskCard key={t._id} task={t} onOpen={(task) => setModal({ task })} onDragStart={handleDragStart} />
                ))}
              </ul>
              <button type="button" className="add-task" onClick={() => setModal({ status: col.status })}>+ Add task</button>
            </section>
          )
        })}
      </div>

      {modal && (
        <TaskModal
          task={modal.task}
          defaultStatus={modal.status}
          project={project}
          people={people}
          onClose={closeModal}
          onSaved={() => { setModal(null); load() }}
        />
      )}
    </>
  )
}
