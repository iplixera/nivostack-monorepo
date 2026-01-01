import { PrismaClient } from '@prisma/client'

/**
 * Primary Prisma Client (Read/Write)
 * 
 * Use this client for all write operations and when read replica is not needed.
 * This connects to the primary database.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  
  // In development, ensure Prisma client is properly initialized
  if (typeof prisma.user === 'undefined') {
    console.warn('⚠️  Prisma client models not available. Restart dev server after running: pnpm prisma generate')
  }
}
