import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import { useTodos } from './hooks/useTodos'
import LoginScreen from './components/LoginScreen'
import TodoForm from './components/TodoForm'
import TodoItem from './components/TodoItem'
import FilterBar from './components/FilterBar'
import StatsBar from './components/StatsBar'
import './App.css'

export const FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
}

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

export default function App() {
  const { user, logout } = useAuth()
  const { todos, addTodo, updateTodo, toggleTodo, deleteTodo, clearCompleted } = useTodos(user?.uid)

  const [filter, setFilter] = useState(FILTERS.ALL)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [sortBy, setSortBy] = useState('createdAt')

  if (user === undefined) {
    return (
      <div className="app">
        <div className="loading-screen" aria-label="로딩 중">
          <div className="spinner" />
        </div>
      </div>
    )
  }

  if (!user) return <LoginScreen />

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
      // Firestore serverTimestamp is an object; fall back to 0 while pending
      const aTime = a.createdAt?.toMillis?.() ?? 0
      const bTime = b.createdAt?.toMillis?.() ?? 0
      return bTime - aTime
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
          <div className="header-user">
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="user-avatar"
              referrerPolicy="no-referrer"
            />
            <div className="user-info">
              <span className="user-name">{user.displayName}</span>
              <button className="logout-btn" onClick={logout}>로그아웃</button>
            </div>
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
              onToggle={() => toggleTodo(todo.id, todo.completed)}
              onDelete={() => deleteTodo(todo.id)}
              onStartEdit={() => setEditingId(editingId === todo.id ? null : todo.id)}
              onUpdate={(changes) => { updateTodo(todo.id, changes); setEditingId(null) }}
              onCancelEdit={() => setEditingId(null)}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}
