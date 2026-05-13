import { createAPIFileRoute } from '@tanstack/react-start/api'
import { db } from '@/db'
import { todos } from '@/db/schema'
import { desc } from 'drizzle-orm'

export const APIRoute = createAPIFileRoute('/api/todos')({
  GET: async () => {
    const allTodos = await db.select().from(todos).orderBy(desc(todos.createdAt))
    return Response.json(allTodos)
  },
  POST: async ({ request }) => {
    const body = await request.json()
    const { title } = body
    
    if (!title || typeof title !== 'string') {
      return Response.json({ error: 'Title is required' }, { status: 400 })
    }
    
    const newTodo = await db.insert(todos).values({ title }).returning()
    return Response.json(newTodo[0], { status: 201 })
  },
})
