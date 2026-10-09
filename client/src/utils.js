export const COLUMNS = [
  { status: 'todo', label: 'To do' },
  { status: 'in_progress', label: 'In progress' },
  { status: 'done', label: 'Done' },
]

export const PROJECT_COLORS = ['#6366f1', '#0f766e', '#d97706', '#be123c', '#2563eb', '#7c3aed', '#15803d']

const startOfToday = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

// "Overdue", "Today", "Tomorrow" or a short date.
export function dueLabel(dueDate) {
  if (!dueDate) return null
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const diffDays = Math.round((due - startOfToday()) / 86400000)
  if (diffDays < 0) return { text: 'Overdue', tone: 'danger' }
  if (diffDays === 0) return { text: 'Today', tone: 'warn' }
  if (diffDays === 1) return { text: 'Tomorrow', tone: 'warn' }
  return { text: due.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), tone: '' }
}

// Value for <input type="date"> from an ISO date string.
export const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '')
