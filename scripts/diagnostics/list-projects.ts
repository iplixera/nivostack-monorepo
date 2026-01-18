#!/usr/bin/env tsx
/**
 * List all projects in the database
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pxtdfnwvixmyxhcdcgup.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

interface Project {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

async function listProjects() {
  console.log('📁 Projects in Database')
  console.log('━'.repeat(80))

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set')
    process.exit(1)
  }

  const url = `${SUPABASE_URL}/rest/v1/Project?select=id,name,createdAt,updatedAt&order=createdAt.desc`

  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    const error = await response.text()
    console.error(`❌ Query failed: ${response.status} ${response.statusText}`)
    console.error(error)
    process.exit(1)
  }

  const projects = await response.json() as Project[]

  console.log(`Found ${projects.length} projects:\n`)

  for (const project of projects) {
    console.log(`📦 ${project.name}`)
    console.log(`   ID: ${project.id}`)
    console.log(`   Created: ${project.createdAt}`)
    console.log('')
  }

  // Now get trace counts for each project
  console.log('📊 Trace Counts:')
  for (const project of projects) {
    const traceUrl = `${SUPABASE_URL}/rest/v1/ApiTrace?projectId=eq.${project.id}&select=id`
    const traceResponse = await fetch(traceUrl, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    })

    const contentRange = traceResponse.headers.get('content-range')
    const count = contentRange ? parseInt(contentRange.split('/')[1]) : 0

    console.log(`   ${project.name}: ${count} traces`)
  }
}

listProjects()
