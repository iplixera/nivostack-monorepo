import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from dashboard/.env.local
config({ path: resolve(__dirname, '../dashboard/.env.local') })

import { prisma } from '../dashboard/src/lib/prisma'

async function getProjectId(apiKey: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { apiKey },
      select: { id: true, name: true }
    })

    if (!project) {
      console.error(`Project not found for API key: ${apiKey}`)
      process.exit(1)
    }

    console.log(`Project Name: ${project.name}`)
    console.log(`Project ID: ${project.id}`)
    return project.id
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

const apiKey = process.argv[2]
if (!apiKey) {
  console.error('Usage: tsx scripts/get-project-id.ts <api-key>')
  process.exit(1)
}

getProjectId(apiKey)

