import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, beforeEach, describe, expect, it } from "vitest"
import Database from "better-sqlite3"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "../../generated/prisma/client"
import {
  createTodoWith,
  deleteTodoWith,
  listTodosWith,
  updateTodoWith,
  validateCreateInput,
  validateDeleteInput,
  validateUpdateInput,
} from "./todos"

const tempDir = mkdtempSync(join(tmpdir(), "todo-tests-"))
const dbPath = join(tempDir, "test.db")
const dbUrl = `file:${dbPath}`

const migrationsRoot = join(process.cwd(), "prisma", "migrations")
const migrationDirs = readdirSync(migrationsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()

const setupDb = new Database(dbPath)
for (const dir of migrationDirs) {
  const sql = readFileSync(join(migrationsRoot, dir, "migration.sql"), "utf8")
  setupDb.exec(sql)
}
setupDb.close()

const adapter = new PrismaBetterSqlite3({ url: dbUrl })
const prisma = new PrismaClient({ adapter })

afterAll(async () => {
  await prisma.$disconnect()
  rmSync(tempDir, { recursive: true, force: true })
})

beforeEach(async () => {
  await prisma.todo.deleteMany({})
})

describe("todo CRUD", () => {
  it("creates a todo with the given title", async () => {
    const todo = await createTodoWith(prisma, "Buy groceries")
    expect(todo.id).toBeGreaterThan(0)
    expect(todo.title).toBe("Buy groceries")
    expect(todo.completed).toBe(false)
  })

  it("lists todos newest first, with incomplete before completed", async () => {
    await createTodoWith(prisma, "First")
    await new Promise((r) => setTimeout(r, 5))
    const second = await createTodoWith(prisma, "Second")
    await new Promise((r) => setTimeout(r, 5))
    const third = await createTodoWith(prisma, "Third")
    await updateTodoWith(prisma, second.id, { completed: true })

    const todos = await listTodosWith(prisma)

    expect(todos.map((t) => t.title)).toEqual(["Third", "First", "Second"])
    const lastTodo = todos[todos.length - 1]
    expect(lastTodo).toBeDefined()
    expect(lastTodo.id).toBe(second.id)
    expect(lastTodo.completed).toBe(true)
    expect(todos[0].id).toBe(third.id)
  })

  it("updates a todo title", async () => {
    const todo = await createTodoWith(prisma, "Old title")
    const updated = await updateTodoWith(prisma, todo.id, {
      title: "New title",
    })
    expect(updated.title).toBe("New title")
    expect(updated.completed).toBe(false)
  })

  it("marks a todo as complete and back to incomplete", async () => {
    const todo = await createTodoWith(prisma, "Toggle me")
    const completed = await updateTodoWith(prisma, todo.id, {
      completed: true,
    })
    expect(completed.completed).toBe(true)
    const reopened = await updateTodoWith(prisma, todo.id, {
      completed: false,
    })
    expect(reopened.completed).toBe(false)
  })

  it("deletes a todo", async () => {
    const todo = await createTodoWith(prisma, "Remove me")
    const result = await deleteTodoWith(prisma, todo.id)
    expect(result).toEqual({ success: true })
    const remaining = await listTodosWith(prisma)
    expect(remaining).toEqual([])
  })
})

describe("input validation", () => {
  it("rejects empty or whitespace-only titles on create", () => {
    expect(() => validateCreateInput({ title: "" })).toThrow(/title/i)
    expect(() => validateCreateInput({ title: "   " })).toThrow(/title/i)
    expect(() => validateCreateInput({})).toThrow(/title/i)
    expect(() => validateCreateInput(null)).toThrow(/invalid/i)
  })

  it("trims whitespace from valid titles on create", () => {
    expect(validateCreateInput({ title: "  Hello  " })).toEqual({
      title: "Hello",
    })
  })

  it("requires a numeric id on update and delete", () => {
    expect(() => validateUpdateInput({ id: "1" })).toThrow(/id/i)
    expect(() => validateUpdateInput({})).toThrow(/id/i)
    expect(() => validateDeleteInput({ id: "abc" })).toThrow(/id/i)
    expect(validateDeleteInput({ id: 1 })).toEqual({ id: 1 })
  })

  it("rejects empty titles and non-boolean completed on update", () => {
    expect(() => validateUpdateInput({ id: 1, title: "" })).toThrow(
      /non-empty/i
    )
    expect(() => validateUpdateInput({ id: 1, completed: "yes" })).toThrow(
      /boolean/i
    )
  })

  it("trims titles on update and passes through completed", () => {
    expect(
      validateUpdateInput({ id: 5, title: "  hi  ", completed: true })
    ).toEqual({ id: 5, title: "hi", completed: true })
  })
})
