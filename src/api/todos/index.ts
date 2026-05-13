import { createServerFn } from '@tanstack/react-start'
import { db } from '../../db'
import { todos } from '../../db/schema'
import { desc, eq } from 'drizzle-orm'

export const getTodos = createServerFn({ method: 'GET' }).handler(async () => {
  const allTodos = await db.select().from(todos).orderBy(desc(todos.createdAt))
  return allTodos
})

export const createTodo = createServerFn({ method: 'POST' }).handler(async (ctx) => {
  const data = ctx.data as unknown as { title: string }
  const { title } = data
  
  if (!title || typeof title !== 'string') {
    throw new Error('Title is required')
  }
  
  const newTodo = await db.insert(todos).values({ title }).returning()
  return newTodo[0]
})

export const updateTodo = createServerFn({ method: 'POST' }).handler(async (ctx) => {
  const data = ctx.data as unknown as { id: number; title?: string; completed?: boolean }
  const { id, title, completed } = data
  
  if (isNaN(id)) {
    throw new Error('Invalid ID')
  }
  
  const updateData: Record<string, string | boolean> = {}
  if (title !== undefined) updateData.title = title
  if (completed !== undefined) updateData.completed = completed
  
  const updated = await db
    .update(todos)
    .set(updateData)
    .where(eq(todos.id, id))
    .returning()
  
  if (updated.length === 0) {
    throw new Error('Todo not found')
  }
  
  return updated[0]
})

export const deleteTodo = createServerFn({ method: 'POST' }).handler(async (ctx) => {
  const data = ctx.data as unknown as { id: number }
  const { id } = data
  
  if (isNaN(id)) {
    throw new Error('Invalid ID')
  }
  
  const deleted = await db
    .delete(todos)
    .where(eq(todos.id, id))
    .returning()
  
  if (deleted.length === 0) {
    throw new Error('Todo not found')
  }
  
  return { success: true }
})
