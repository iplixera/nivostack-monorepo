import { PrismaClient } from '@prisma/client'

/**
 * Read Replica Prisma Client
 * 
 * Use this client for read-only queries in the dashboard to reduce load on primary database.
 * Falls back to primary database if read replica is not configured.
 */

const globalForPrismaRead = globalThis as unknown as {
  prismaRead: PrismaClient | undefined
}

// Create read replica client if URL is provided, otherwise use primary
const readReplicaUrl = process.env.POSTGRES_READ_REPLICA_URL || process.env.POSTGRES_PRISMA_URL

export const prismaRead = globalForPrismaRead.prismaRead ?? new PrismaClient({
  datasources: {
    db: {
      url: readReplicaUrl,
    },
  },
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrismaRead.prismaRead = prismaRead
}

/**
 * Usage:
 * 
 * For read-only queries (dashboard analytics, device lists, reports):
 *   import { prismaRead } from '@/lib/prisma-read'
 *   const devices = await prismaRead.device.findMany()
 * 
 * For write operations (always use primary):
 *   import { prisma } from '@/lib/prisma'
 *   await prisma.device.update(...)
 */

