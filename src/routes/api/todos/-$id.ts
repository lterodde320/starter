import { createAPIFileRoute } from '@tanstack/react-start/api'
import { db } from '@/db'
import { todos } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const APIRoute = createAPIFileRoute('/api/todos/:id')({
  PUT: async ({ request, params }) => {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return Response.json({ error: 'Invalid ID' }, { status: 400 })
    }
    
    const body = await request.json()
    const { title, completed } = body
    
    const updateData: Record<string, string | boolean> = {}
    if (title !== undefined) updateData.title = title
    if (completed !== undefined) updateData.completed = completed
    
    const updated = await db
      .update(todos)
      .set(updateData)
      .where(eq(todos.id, id))
      .returning()
    
    if (updated.length === 0) {
      return Response.json({ error: 'Todo not found' }, { status: 404 })
    }
    
    return Response.json(updated[0])
  },
  DELETE: async ({ params }) => {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return Response.json({ error: 'Invalid ID' }, { status: 400 })
    }
    
    const deleted = await db
      .delete(todos)
      .where(eq(todos.id, id))
      .returning()
    
    if (deleted.length === 0) {
      return Response.json({ error: 'Todo not found' }, { status: 404 })
    }
    
    return new Response(null, { status: 204 })
  },
})
