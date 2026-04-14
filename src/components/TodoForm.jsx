import { useState } from 'react'

const PRIORITIES = [
  { value: 'high', label: '높음', emoji: '🔴' },
  { value: 'medium', label: '보통', emoji: '🟡' },
  { value: 'low', label: '낮음', emoji: '🟢' },
]

export default function TodoForm({ onAdd }) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [expanded, setExpanded] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onAdd({ text: trimmed, priority, dueDate: dueDate || null })
    setText('')
    setDueDate('')
    setPriority('medium')
    setExpanded(false)
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit} aria-label="새 할 일 추가">
      <div className="form-main">
        <input
          className="form-input"
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder="새 할 일을 입력하세요..."
          aria-label="할 일 내용"
          maxLength={200}
        />
        <button
          type="submit"
          className="form-submit"
          disabled={!text.trim()}
          aria-label="추가"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="form-extras">
          <div className="priority-group" role="group" aria-label="우선순위">
            {PRIORITIES.map(p => (
              <label key={p.value} className={`priority-btn ${priority === p.value ? 'selected' : ''} priority-${p.value}`}>
                <input
                  type="radio"
                  name="priority"
                  value={p.value}
                  checked={priority === p.value}
                  onChange={() => setPriority(p.value)}
                  className="sr-only"
                />
                <span aria-hidden="true">{p.emoji}</span>
                {p.label}
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
              value={dueDate}
              min={today}
              onChange={e => setDueDate(e.target.value)}
              className="date-input"
              aria-label="마감일"
            />
          </label>
        </div>
      )}
    </form>
  )
}
