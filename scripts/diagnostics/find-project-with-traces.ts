#!/usr/bin/env tsx
/**
 * Find which project has traces matching criteria
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pxtdfnwvixmyxhcdcgup.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

async function findProjects() {
  console.log('🔍 Finding projects with traces...\n')

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set')
    process.exit(1)
  }

  // Get all projects
  const projectsUrl = `${SUPABASE_URL}/rest/v1/Project?select=id,name`
  const projectsRes = await fetch(projectsUrl, {
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    }
  })
  const projects = await projectsRes.json()

  console.log(`Found ${projects.length} projects\n`)

  // Get trace count for each
  for (const project of projects) {
    const traceUrl = `${SUPABASE_URL}/rest/v1/ApiTrace?projectId=eq.${project.id}&select=id`
    const traceRes = await fetch(traceUrl, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'count=exact'
      }
    })

    const contentRange = traceRes.headers.get('content-range')
    const count = contentRange ? parseInt(contentRange.split('/')[1]) : 0

    if (count > 0) {
      console.log(`📦 ${project.name}`)
      console.log(`   ID: ${project.id}`)
      console.log(`   Traces: ${count}`)

      // Get sample trace to show environment
      const sampleUrl = `${SUPABASE_URL}/rest/v1/ApiTrace?projectId=eq.${project.id}&select=url,screenName,statusCode,timestamp&order=createdAt.desc&limit=3`
      const sampleRes = await fetch(sampleUrl, {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        }
      })
      const samples = await sampleRes.json()

      if (samples.length > 0) {
        console.log('   Recent traces:')
        samples.forEach((s: any) => {
          try {
            const url = new URL(s.url)
            console.log(`   - ${url.hostname} | Status: ${s.statusCode} | Screen: ${s.screenName || 'NULL'}`)
          } catch {
            console.log(`   - ${s.url} | Status: ${s.statusCode}`)
          }
        })
      }
      console.log('')
    }
  }
}

findProjects()
