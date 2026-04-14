import { useState, useRef, useEffect } from 'react'

const PRIORITY_META = {
  high: { label: '높음', emoji: '🔴', cls: 'high' },
  medium: { label: '보통', emoji: '🟡', cls: 'medium' },
  low: { label: '낮음', emoji: '🟢', cls: 'low' },
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((d - today) / 86400000)

  if (diff < 0) return { text: `${Math.abs(diff)}일 지남`, overdue: true }
  if (diff === 0) return { text: '오늘 마감', today: true }
  if (diff === 1) return { text: '내일 마감', soon: true }
  if (diff <= 3) return { text: `${diff}일 후 마감`, soon: true }
  return { text: d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) }
}

export default function TodoItem({ todo, isEditing, onToggle, onDelete, onStartEdit, onUpdate, onCancelEdit }) {
  const [editText, setEditText] = useState(todo.text)
  const [editPriority, setEditPriority] = useState(todo.priority)
  const [editDueDate, setEditDueDate] = useState(todo.dueDate || '')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing) {
      setEditText(todo.text)
      setEditPriority(todo.priority)
      setEditDueDate(todo.dueDate || '')
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [isEditing, todo])

  function handleEditSubmit(e) {
    e.preventDefault()
    const trimmed = editText.trim()
    if (!trimmed) return
    onUpdate({ text: trimmed, priority: editPriority, dueDate: editDueDate || null })
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') onCancelEdit()
  }

  const due = formatDate(todo.dueDate)
  const priority = PRIORITY_META[todo.priority] || PRIORITY_META.medium
  const today = new Date().toISOString().split('T')[0]

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''} ${isEditing ? 'editing' : ''}`} role="listitem">
      {isEditing ? (
        <form className="edit-form" onSubmit={handleEditSubmit} onKeyDown={handleKeyDown}>
          <input
            ref={inputRef}
            className="edit-input"
            type="text"
            value={editText}
            onChange={e => setEditText(e.target.value)}
            maxLength={200}
            aria-label="할 일 수정"
          />
          <div className="edit-extras">
            <div className="priority-group" role="group" aria-label="우선순위">
              {Object.entries(PRIORITY_META).map(([val, meta]) => (
                <label key={val} className={`priority-btn ${editPriority === val ? 'selected' : ''} priority-${val}`}>
                  <input
                    type="radio"
                    name="edit-priority"
                    value={val}
                    checked={editPriority === val}
                    onChange={() => setEditPriority(val)}
                    className="sr-only"
                  />
                  <span aria-hidden="true">{meta.emoji}</span>
                  {meta.label}
                </label>
              ))}
            </div>
            <label className="date-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                type="date"
                value={editDueDate}
                min={today}
                onChange={e => setEditDueDate(e.target.value)}
                className="date-input"
                aria-label="마감일"
              />
            </label>
          </div>
          <div className="edit-actions">
            <button type="submit" className="btn-save" disabled={!editText.trim()}>저장</button>
            <button type="button" className="btn-cancel" onClick={onCancelEdit}>취소</button>
          </div>
        </form>
      ) : (
        <div className="item-row">
          <button
            className={`checkbox ${todo.completed ? 'checked' : ''}`}
            onClick={onToggle}
            aria-label={todo.completed ? '완료 취소' : '완료 표시'}
            aria-pressed={todo.completed}
          >
            {todo.completed && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>

          <div className="item-body">
            <div className="item-header">
              <span className={`priority-dot priority-${priority.cls}`} title={`우선순위: ${priority.label}`} aria-label={`우선순위 ${priority.label}`} />
              <span className="item-text">{todo.text}</span>
            </div>
            {due && (
              <span className={`due-date ${due.overdue ? 'overdue' : ''} ${due.today ? 'today' : ''} ${due.soon ? 'soon' : ''}`}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {due.text}
              </span>
            )}
          </div>

          <div className="item-actions">
            <button className="action-btn edit-btn" onClick={onStartEdit} aria-label="수정">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button className="action-btn delete-btn" onClick={onDelete} aria-label="삭제">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </li>
  )
}
