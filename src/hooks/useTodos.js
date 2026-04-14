import { useEffect, useState, useCallback } from 'react'
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, query, orderBy, serverTimestamp, writeBatch
} from 'firebase/firestore'
import { db } from '../firebase'

const SHARED_COLLECTION = 'todos'

export function useTodos(uid) {
  const [todos, setTodos] = useState([])

  useEffect(() => {
    if (!uid) { setTodos([]); return }

    const q = query(
      collection(db, SHARED_COLLECTION),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, snap => {
      setTodos(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [uid])

  const ref = useCallback(
    () => collection(db, SHARED_COLLECTION),
    []
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
    await updateDoc(doc(db, SHARED_COLLECTION, id), changes)
  }, [])

  const toggleTodo = useCallback(async (id, completed) => {
    await updateDoc(doc(db, SHARED_COLLECTION, id), { completed: !completed })
  }, [])

  const deleteTodo = useCallback(async (id) => {
    await deleteDoc(doc(db, SHARED_COLLECTION, id))
  }, [])

  const clearCompleted = useCallback(async () => {
    const batch = writeBatch(db)
    todos.filter(t => t.completed).forEach(t => {
      batch.delete(doc(db, SHARED_COLLECTION, t.id))
    })
    await batch.commit()
  }, [todos])

  return { todos, addTodo, updateTodo, toggleTodo, deleteTodo, clearCompleted }
}
