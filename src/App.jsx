import { useState, useEffect, useCallback } from 'react'
import TodoForm from './components/TodoForm'
import TodoItem from './components/TodoItem'
import FilterBar from './components/FilterBar'
import StatsBar from './components/StatsBar'
import './App.css'

const STORAGE_KEY = 'claude-todos'

export const FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
}

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

export default function App() {
  const [todos, setTodos] = useState(loadTodos)
  const [filter, setFilter] = useState(FILTERS.ALL)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [sortBy, setSortBy] = useState('createdAt')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const addTodo = useCallback((data) => {
    setTodos(prev => [{
      id: crypto.randomUUID(),
      text: data.text,
      priority: data.priority || 'medium',
      dueDate: data.dueDate || null,
      completed: false,
      createdAt: Date.now(),
    }, ...prev])
  }, [])

  const updateTodo = useCallback((id, changes) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, ...changes } : t))
    setEditingId(null)
  }, [])

  const toggleTodo = useCallback((id) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }, [])

  const deleteTodo = useCallback((id) => {
    setTodos(prev => prev.filter(t => t.id !== id))
  }, [])

  const clearCompleted = useCallback(() => {
    setTodos(prev => prev.filter(t => !t.completed))
  }, [])

  const filtered = todos
    .filter(t => {
      if (filter === FILTERS.ACTIVE && t.completed) return false
      if (filter === FILTERS.COMPLETED && !t.completed) return false
      if (search && !t.text.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate) - new Date(b.dueDate)
      }
      return b.createdAt - a.createdAt
    })

  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="header-icon" aria-hidden="true">✓</div>
          <div className="header-text">
            <h1 className="header-title">할 일 목록</h1>
            <p className="header-subtitle">오늘도 하나씩 해나가요</p>
          </div>
        </header>

        <StatsBar stats={stats} />

        <TodoForm onAdd={addTodo} />

        <FilterBar
          filter={filter}
          onFilter={setFilter}
          search={search}
          onSearch={setSearch}
          sortBy={sortBy}
          onSort={setSortBy}
          filters={FILTERS}
          hasCompleted={stats.completed > 0}
          onClearCompleted={clearCompleted}
        />

        <ul className="todo-list" role="list">
          {filtered.length === 0 ? (
            <li className="empty-state" aria-live="polite">
              {search
                ? `"${search}"에 대한 결과가 없습니다`
                : filter === FILTERS.COMPLETED
                ? '완료된 항목이 없습니다'
                : filter === FILTERS.ACTIVE
                ? '진행 중인 항목이 없습니다'
                : '할 일을 추가해보세요 🎉'}
            </li>
          ) : filtered.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              isEditing={editingId === todo.id}
              onToggle={() => toggleTodo(todo.id)}
              onDelete={() => deleteTodo(todo.id)}
              onStartEdit={() => setEditingId(editingId === todo.id ? null : todo.id)}
              onUpdate={(changes) => updateTodo(todo.id, changes)}
              onCancelEdit={() => setEditingId(null)}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}
