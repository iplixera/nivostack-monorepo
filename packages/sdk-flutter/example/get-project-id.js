// Quick script to get project ID from API key
// Run from dashboard directory: node ../packages/sdk-flutter/example/get-project-id.js

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const apiKey = 'cmjoin79y00069z09upepkf11'
  const project = await prisma.project.findUnique({
    where: { apiKey },
    select: { id: true, name: true }
  })
  
  if (project) {
    console.log(`Project Name: ${project.name}`)
    console.log(`Project ID: ${project.id}`)
  } else {
    console.error('Project not found')
  }
  
  await prisma.$disconnect()
}

main().catch(console.error)

