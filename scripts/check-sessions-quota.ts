const API_BASE = 'http://localhost:3000'

async function checkSessionsQuota() {
  console.log('\n=== Checking Sessions Quota ===\n')
  
  // Check current usage
  const usageResponse = await fetch(`${API_BASE}/api/subscription/usage`, {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWpvaTJrOGEwMDAwOXowOTU1NWo2cmg5IiwiaWF0IjoxNzY2ODUyMDE1LCJleHAiOjE3Njc0NTY4MTV9.0r1-Z1hB0ywxAiePWIxm7kAf8CdqGJazBG-DKBtimAQ'
    }
  })
  
  const usageData = await usageResponse.json()
  const sessionsUsage = usageData.usage?.sessions || { used: 0, limit: null, percentage: 0 }
  
  console.log('Sessions Usage:')
  console.log(`  Used: ${sessionsUsage.used}/${sessionsUsage.limit || 'unlimited'} (${sessionsUsage.percentage.toFixed(1)}%)`)
  
  // Get project
  const projectResponse = await fetch(`${API_BASE}/api/projects`, {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWpvaTJrOGEwMDAwOXowOTU1NWo2cmg5IiwiaWF0IjoxNzY2ODUyMDE1LCJleHAiOjE3Njc0NTY4MTV9.0r1-Z1hB0ywxAiePWIxm7kAf8CdqGJazBG-DKBtimAQ'
    }
  })
  
  const projectsData = await projectResponse.json()
  const project = projectsData.projects?.[0]
  
  if (!project) {
    console.error('❌ No projects found')
    return
  }
  
  // Get sessions via API
  const sessionsResponse = await fetch(`${API_BASE}/api/sessions?projectId=${project.id}`, {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWpvaTJrOGEwMDAwOXowOTU1NWo2cmg5IiwiaWF0IjoxNzY2ODUyMDE1LCJleHAiOjE3Njc0NTY4MTV9.0r1-Z1hB0ywxAiePWIxm7kAf8CdqGJazBG-DKBtimAQ'
    }
  })
  
  const sessionsData = await sessionsResponse.json()
  console.log(`\nTotal sessions via API: ${sessionsData.sessions?.length || 0}`)
  
  if (sessionsData.sessions && sessionsData.sessions.length > 0) {
    console.log('\nSessions:')
    sessionsData.sessions.forEach((session: any, index: number) => {
      console.log(`\n${index + 1}. ${session.sessionToken}`)
      console.log(`   Device: ${session.device?.deviceId || 'N/A'}`)
      console.log(`   Started: ${session.startedAt}`)
      console.log(`   Active: ${session.isActive}`)
      console.log(`   Traces: ${session._count?.apiTraces || 0}`)
    })
  }
  
  // Get flow data (sessions with screen flow)
  const flowResponse = await fetch(`${API_BASE}/api/flow?projectId=${project.id}`, {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWpvaTJrOGEwMDAwOXowOTU1NWo2cmg5IiwiaWF0IjoxNzY2ODUyMDE1LCJleHAiOjE3Njc0NTY4MTV9.0r1-Z1hB0ywxAiePWIxm7kAf8CdqGJazBG-DKBtimAQ'
    }
  })
  
  const flowData = await flowResponse.json()
  console.log(`\nSessions with screen flow data: ${flowData.sessions?.length || 0}`)
  
  if (flowData.sessions && flowData.sessions.length > 0) {
    console.log('\nSessions with Screen Flow:')
    flowData.sessions.forEach((session: any, index: number) => {
      console.log(`\n${index + 1}. ${session.sessionToken}`)
      console.log(`   Screens: ${session.screenSequence?.join(' -> ') || 'None'}`)
      console.log(`   Requests: ${session.requestCount}`)
    })
  }
}

checkSessionsQuota().catch(console.error)
