import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { getTodos, createTodo, updateTodo, deleteTodo } from '@/api/todos'

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
      const data = await getTodos()
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
      const todo = await createTodo({ data: { title: newTodo } })
      setTodos([todo, ...todos])
      setNewTodo('')
    } catch (error) {
      console.error('Failed to add todo:', error)
    }
  }

  async function toggleTodo(id: number, completed: boolean) {
    try {
      const updated = await updateTodo({ data: { id, completed: !completed } })
      setTodos(todos.map((t) => (t.id === id ? updated : t)))
    } catch (error) {
      console.error('Failed to toggle todo:', error)
    }
  }

  async function deleteTodoItem(id: number) {
    try {
      await deleteTodo({ data: { id } })
      setTodos(todos.filter((t) => t.id !== id))
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
                    onClick={() => deleteTodoItem(todo.id)}
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
