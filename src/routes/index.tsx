import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface Todo {
  id: number
  title: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTodos()
  }, [])

  async function fetchTodos() {
    try {
      const res = await fetch('/api/todos')
      const data = await res.json()
      setTodos(data)
    } catch (error) {
      console.error('Failed to fetch todos:', error)
    } finally {
      setLoading(false)
    }
  }

  async function addTodo(e: React.FormEvent) {
    e.preventDefault()
    if (!newTodo.trim()) return

    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTodo }),
      })
      if (res.ok) {
        const todo = await res.json()
        setTodos([todo, ...todos])
        setNewTodo('')
      }
    } catch (error) {
      console.error('Failed to add todo:', error)
    }
  }

  async function toggleTodo(id: number, completed: boolean) {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      })
      if (res.ok) {
        const updated = await res.json()
        setTodos(todos.map((t) => (t.id === id ? updated : t)))
      }
    } catch (error) {
      console.error('Failed to toggle todo:', error)
    }
  }

  async function deleteTodo(id: number) {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setTodos(todos.filter((t) => t.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose w-full">
        <div>
          <h1 className="text-2xl font-bold mb-4">Todo App</h1>
          <p className="mb-4 text-muted-foreground">
            A simple to-do app powered by DrizzleORM and SQLite
          </p>

          <form onSubmit={addTodo} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new todo..."
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit">Add</Button>
          </form>

          {loading ? (
            <p>Loading...</p>
          ) : todos.length === 0 ? (
            <p className="text-muted-foreground">No todos yet. Add one above!</p>
          ) : (
            <ul className="space-y-2">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center gap-2 p-3 border rounded-md"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id, todo.completed)}
                    className="h-4 w-4"
                  />
                  <span
                    className={`flex-1 ${
                      todo.completed ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {todo.title}
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
