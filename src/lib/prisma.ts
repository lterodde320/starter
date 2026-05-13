import { PrismaClient } from "@prisma/client"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(__dirname, "../../prisma/dev.db")

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: `file:${dbPath}`,
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
