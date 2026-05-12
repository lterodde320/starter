import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { TrashIcon } from "lucide-react"
import type { FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  createTodo,
  deleteTodo,
  listTodos,
  updateTodo,
} from "@/server/todos"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/")({
  component: TodoApp,
  loader: () => listTodos(),
})

function TodoApp() {
  const router = useRouter()
  const todos = Route.useLoaderData()
  const [newTitle, setNewTitle] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [pending, setPending] = useState(false)

  const refresh = () => router.invalidate()

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = newTitle.trim()
    if (!title) return
    setPending(true)
    try {
      await createTodo({ data: { title } })
      setNewTitle("")
      await refresh()
    } finally {
      setPending(false)
    }
  }

  async function handleToggle(id: number, completed: boolean) {
    await updateTodo({ data: { id, completed } })
    await refresh()
  }

  async function handleDelete(id: number) {
    await deleteTodo({ data: { id } })
    await refresh()
  }

  function startEditing(id: number, title: string) {
    setEditingId(id)
    setEditingTitle(title)
  }

  async function commitEdit(id: number) {
    const title = editingTitle.trim()
    setEditingId(null)
    if (!title) return
    await updateTodo({ data: { id, title } })
    await refresh()
  }

  return (
    <main className="flex min-h-svh justify-center bg-background p-6">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Todos</h1>
          <p className="text-sm text-muted-foreground">
            A tiny todo list, powered by Prisma + SQLite.
          </p>
        </header>

        <form onSubmit={handleCreate} className="flex gap-2">
          <Input
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="What needs doing?"
            aria-label="New todo title"
            disabled={pending}
          />
          <Button type="submit" disabled={pending || newTitle.trim() === ""}>
            Add
          </Button>
        </form>

        <ul className="flex flex-col gap-1" data-testid="todo-list">
          {todos.length === 0 ? (
            <li className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              No todos yet. Add one above.
            </li>
          ) : (
            todos.map((todo) => (
              <li
                key={todo.id}
                className="group flex items-center gap-3 rounded-lg border border-border bg-card p-2.5"
                data-testid={`todo-item-${todo.id}`}
              >
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={(checked) =>
                    handleToggle(todo.id, checked === true)
                  }
                  aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
                />
                {editingId === todo.id ? (
                  <Input
                    autoFocus
                    value={editingTitle}
                    onChange={(event) => setEditingTitle(event.target.value)}
                    onBlur={() => commitEdit(todo.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault()
                        commitEdit(todo.id)
                      } else if (event.key === "Escape") {
                        setEditingId(null)
                      }
                    }}
                    aria-label="Edit todo title"
                    className="h-7"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => startEditing(todo.id, todo.title)}
                    className={cn(
                      "flex-1 cursor-text rounded px-1 text-left text-sm",
                      todo.completed &&
                        "text-muted-foreground line-through"
                    )}
                  >
                    {todo.title}
                  </button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete "${todo.title}"`}
                  onClick={() => handleDelete(todo.id)}
                >
                  <TrashIcon />
                </Button>
              </li>
            ))
          )}
        </ul>
      </div>
    </main>
  )
}
