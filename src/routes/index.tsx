import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getTodos, createTodo, updateTodo, deleteTodo } from '@/api/todos'

interface Todo {
  id: number
  title: string
  completed: boolean
  createdAt: Date
  updatedAt: Date
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
      const todo = await createTodo({ data: { title: newTodo } as any })
      setTodos([todo, ...todos])
      setNewTodo('')
    } catch (error) {
      console.error('Failed to add todo:', error)
    }
  }

  async function toggleTodo(id: number, completed: boolean) {
    try {
      const updated = await updateTodo({ data: { id, completed: !completed } as any })
      setTodos(todos.map((t) => (t.id === id ? updated : t)))
    } catch (error) {
      console.error('Failed to toggle todo:', error)
    }
  }

  async function deleteTodoItem(id: number) {
    try {
      await deleteTodo({ data: { id } as any })
      setTodos(todos.filter((t) => t.id !== id))
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Todo App</CardTitle>
          <CardDescription>
            A simple to-do app powered by DrizzleORM and SQLite
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={addTodo} className="flex gap-2">
            <Input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new todo..."
              className="flex-1"
            />
            <Button type="submit">Add</Button>
          </form>

          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : todos.length === 0 ? (
            <p className="text-muted-foreground">
              No todos yet. Add one above!
            </p>
          ) : (
            <ul className="space-y-2">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center gap-3 rounded-lg border p-4"
                >
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id, todo.completed)}
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
        </CardContent>
      </Card>
    </div>
  )
}
