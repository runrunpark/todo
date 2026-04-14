import { useEffect, useState, useCallback } from 'react'
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, query, orderBy, serverTimestamp, writeBatch
} from 'firebase/firestore'
import { db } from '../firebase'

export function useTodos(uid) {
  const [todos, setTodos] = useState([])

  useEffect(() => {
    if (!uid) { setTodos([]); return }

    const q = query(
      collection(db, 'users', uid, 'todos'),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, snap => {
      setTodos(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [uid])

  const ref = useCallback(
    () => collection(db, 'users', uid, 'todos'),
    [uid]
  )

  const addTodo = useCallback(async (data) => {
    await addDoc(ref(), {
      text: data.text,
      priority: data.priority || 'medium',
      dueDate: data.dueDate || null,
      completed: false,
      createdAt: serverTimestamp(),
    })
  }, [ref])

  const updateTodo = useCallback(async (id, changes) => {
    await updateDoc(doc(db, 'users', uid, 'todos', id), changes)
  }, [uid])

  const toggleTodo = useCallback(async (id, completed) => {
    await updateDoc(doc(db, 'users', uid, 'todos', id), { completed: !completed })
  }, [uid])

  const deleteTodo = useCallback(async (id) => {
    await deleteDoc(doc(db, 'users', uid, 'todos', id))
  }, [uid])

  const clearCompleted = useCallback(async () => {
    const batch = writeBatch(db)
    todos.filter(t => t.completed).forEach(t => {
      batch.delete(doc(db, 'users', uid, 'todos', t.id))
    })
    await batch.commit()
  }, [uid, todos])

  return { todos, addTodo, updateTodo, toggleTodo, deleteTodo, clearCompleted }
}
