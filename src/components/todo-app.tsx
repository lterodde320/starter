"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { getTodos, createTodo, updateTodo, deleteTodo, type Todo } from "@/lib/todos"

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTodos()
  }, [])

  async function fetchTodos() {
    try {
      const data = await getTodos()
      setTodos(data)
    } catch (error) {
      console.error("Failed to fetch todos:", error)
    } finally {
      setLoading(false)
    }
  }

  async function addTodo() {
    if (!newTodo.trim()) return
    try {
      const todo = await createTodo({ data: { title: newTodo.trim() } })
      setTodos([todo, ...todos])
      setNewTodo("")
    } catch (error) {
      console.error("Failed to add todo:", error)
    }
  }

  async function toggleTodo(todo: Todo) {
    try {
      const updated = await updateTodo({
        data: { id: todo.id, completed: !todo.completed },
      })
      setTodos(todos.map((t) => (t.id === todo.id ? updated : t)))
    } catch (error) {
      console.error("Failed to toggle todo:", error)
    }
  }

  async function removeTodo(todo: Todo) {
    try {
      await deleteTodo({ data: { id: todo.id } })
      setTodos(todos.filter((t) => t.id !== todo.id))
    } catch (error) {
      console.error("Failed to delete todo:", error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await addTodo()
  }

  if (loading) {
    return <div className="text-center p-4">Loading...</div>
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Todo App</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button type="submit">Add</Button>
      </form>

      <ul className="space-y-2">
        {todos.length === 0 ? (
          <li className="text-center text-gray-500 py-4">No todos yet!</li>
        ) : (
          todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-2 p-3 border rounded-md"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo)}
                className="h-4 w-4"
              />
              <span
                className={`flex-1 ${todo.completed ? "line-through text-gray-400" : ""}`}
              >
                {todo.title}
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeTodo(todo)}
              >
                Delete
              </Button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
