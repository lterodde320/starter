import { createServerFn } from "@tanstack/react-start"
import type { PrismaClient } from "../../generated/prisma/client"
import { prisma } from "@/lib/db"

export type TodoClient = Pick<PrismaClient, "todo">

export function listTodosWith(client: TodoClient) {
  return client.todo.findMany({
    orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
  })
}

export function createTodoWith(client: TodoClient, title: string) {
  return client.todo.create({ data: { title } })
}

export function updateTodoWith(
  client: TodoClient,
  id: number,
  updates: { title?: string; completed?: boolean }
) {
  return client.todo.update({ where: { id }, data: updates })
}

export async function deleteTodoWith(client: TodoClient, id: number) {
  await client.todo.delete({ where: { id } })
  return { success: true as const }
}

export function validateCreateInput(input: unknown): { title: string } {
  if (typeof input !== "object" || input === null) {
    throw new Error("Invalid input")
  }
  const { title } = input as { title?: unknown }
  if (typeof title !== "string" || title.trim().length === 0) {
    throw new Error("Title is required")
  }
  return { title: title.trim() }
}

export function validateUpdateInput(input: unknown): {
  id: number
  title?: string
  completed?: boolean
} {
  if (typeof input !== "object" || input === null) {
    throw new Error("Invalid input")
  }
  const { id, title, completed } = input as {
    id?: unknown
    title?: unknown
    completed?: unknown
  }
  if (typeof id !== "number" || !Number.isFinite(id)) {
    throw new Error("Valid id is required")
  }
  const result: { id: number; title?: string; completed?: boolean } = { id }
  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0) {
      throw new Error("Title must be a non-empty string")
    }
    result.title = title.trim()
  }
  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      throw new Error("Completed must be a boolean")
    }
    result.completed = completed
  }
  return result
}

export function validateDeleteInput(input: unknown): { id: number } {
  if (typeof input !== "object" || input === null) {
    throw new Error("Invalid input")
  }
  const { id } = input as { id?: unknown }
  if (typeof id !== "number" || !Number.isFinite(id)) {
    throw new Error("Valid id is required")
  }
  return { id }
}

export const listTodos = createServerFn({ method: "GET" }).handler(() =>
  listTodosWith(prisma)
)

export const createTodo = createServerFn({ method: "POST" })
  .inputValidator(validateCreateInput)
  .handler(({ data }) => createTodoWith(prisma, data.title))

export const updateTodo = createServerFn({ method: "POST" })
  .inputValidator(validateUpdateInput)
  .handler(({ data }) => {
    const { id, ...updates } = data
    return updateTodoWith(prisma, id, updates)
  })

export const deleteTodo = createServerFn({ method: "POST" })
  .inputValidator(validateDeleteInput)
  .handler(({ data }) => deleteTodoWith(prisma, data.id))
