import { createServerFn } from "@tanstack/react-start"
import { prisma } from "@/lib/prisma"

export interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

export const getTodos = createServerFn({ method: "GET" }).handler(
  async () => {
    const todos = await prisma.todo.findMany({
      orderBy: { createdAt: "desc" },
    })
    return todos
  },
)

export const createTodo = createServerFn({ method: "POST" })
  .inputValidator((d: { title: string }) => ({ title: d.title }))
  .handler(async ({ data }) => {
    const todo = await prisma.todo.create({
      data: {
        title: data.title,
        completed: false,
      },
    })
    return todo
  })

export const updateTodo = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; completed: boolean }) => ({
    id: d.id,
    completed: d.completed,
  }))
  .handler(async ({ data }) => {
    const todo = await prisma.todo.update({
      where: { id: data.id },
      data: { completed: data.completed },
    })
    return todo
  })

export const deleteTodo = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => ({ id: d.id }))
  .handler(async ({ data }) => {
    await prisma.todo.delete({
      where: { id: data.id },
    })
    return { success: true }
  })
