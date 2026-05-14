import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

async function checkDatabase() {
  try {
    const { db } = await import('../db')
    await db.select().from(await import('../db/schema').then(m => m.todos)).limit(1)
    return { status: 'connected' }
  } catch {
    return { status: 'disconnected' }
  }
}

export const Route = createFileRoute('/health')({
  server: {
    handlers: {
      GET: async () => {
        const checks = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          database: await checkDatabase(),
          version: process.env.npm_package_version || 'unknown',
        }

        return json(checks)
      },
    },
  },
})
