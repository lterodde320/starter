import { createFileRoute } from "@tanstack/react-router"
import { TodoApp } from "@/components/todo-app"

export const Route = createFileRoute("/")({ component: App })

function App() {
  return (
    <div className="flex min-h-svh p-6">
      <TodoApp />
    </div>
  )
}
