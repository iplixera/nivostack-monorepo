const API_BASE = 'http://localhost:3000'

async function testBusinessConfigQuota() {
  console.log('\n=== Testing Business Configuration Quota Enforcement ===\n')
  
  // Get project info
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
  
  console.log(`Project: ${project.name}`)
  console.log(`Project ID: ${project.id}\n`)
  
  // Check current usage
  const usageResponse = await fetch(`${API_BASE}/api/subscription/usage`, {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWpvaTJrOGEwMDAwOXowOTU1NWo2cmg5IiwiaWF0IjoxNzY2ODUyMDE1LCJleHAiOjE3Njc0NTY4MTV9.0r1-Z1hB0ywxAiePWIxm7kAf8CdqGJazBG-DKBtimAQ'
    }
  })
  
  const usageData = await usageResponse.json()
  const businessConfigUsage = usageData.usage?.businessConfigKeys || { used: 0, limit: null, percentage: 0 }
  
  console.log('Current Business Config Keys Usage:')
  console.log(`  Used: ${businessConfigUsage.used}/${businessConfigUsage.limit || 'unlimited'} (${businessConfigUsage.percentage.toFixed(1)}%)\n`)
  
  // Get existing configs
  const configsResponse = await fetch(`${API_BASE}/api/business-config?projectId=${project.id}`, {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWpvaTJrOGEwMDAwOXowOTU1NWo2cmg5IiwiaWF0IjoxNzY2ODUyMDE1LCJleHAiOjE3Njc0NTY4MTV9.0r1-Z1hB0ywxAiePWIxm7kAf8CdqGJazBG-DKBtimAQ'
    }
  })
  
  const configsData = await configsResponse.json()
  console.log(`Existing configs: ${configsData.configs?.length || 0}\n`)
  
  // Calculate how many configs we need to create
  const remainingConfigs = businessConfigUsage.limit ? Math.max(0, businessConfigUsage.limit - businessConfigUsage.used) : 10
  const configsToCreate = Math.min(remainingConfigs + 3, 10) // Create enough to exceed limit
  
  console.log(`Creating ${configsToCreate} business config keys to test quota enforcement...\n`)
  
  const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWpvaTJrOGEwMDAwOXowOTU1NWo2cmg5IiwiaWF0IjoxNzY2ODUyMDE1LCJleHAiOjE3Njc0NTY4MTV9.0r1-Z1hB0ywxAiePWIxm7kAf8CdqGJazBG-DKBtimAQ'
  
  let successCount = 0
  let blockedCount = 0
  
  const configTypes = ['string', 'integer', 'boolean', 'decimal', 'json']
  const categories = ['feature', 'ui', 'api', 'payment', 'analytics']
  
  for (let i = 0; i < configsToCreate; i++) {
    const configType = configTypes[i % configTypes.length]
    const category = categories[i % categories.length]
    const key = `test.config.${Date.now()}.${i}`
    
    // Set value based on type (API expects 'value' field, not specific value fields)
    let value: any
    switch (configType) {
      case 'string':
        value = `test-value-${i}`
        break
      case 'integer':
        value = 100 + i
        break
      case 'boolean':
        value = i % 2 === 0
        break
      case 'decimal':
        value = 10.5 + i
        break
      case 'json':
        value = { test: `value-${i}`, number: i }
        break
    }
    
    const body = {
      projectId: project.id,
      key,
      valueType: configType,
      value, // API will convert this using getValueFields
      category,
      label: `Test Config ${i + 1}`,
      description: `Test business config ${i + 1} for quota testing`
    }
    
    const configResponse = await fetch(`${API_BASE}/api/business-config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(body)
    })
    
    const contentType = configResponse.headers.get('content-type') || ''
    let responseData: any
    
    if (contentType.includes('application/json')) {
      responseData = await configResponse.json()
    } else {
      const text = await configResponse.text()
      responseData = { raw: text }
    }
    
    if (configResponse.ok && !responseData.error) {
      successCount++
      if (i < 3) {
        console.log(`  ✅ Config ${i + 1}: ${key} (${configType}) (Status: ${configResponse.status})`)
      }
    } else if (configResponse.status === 429 || configResponse.status === 403) {
      blockedCount++
      console.log(`  🚫 Config ${i + 1} BLOCKED: ${key} (Status: ${configResponse.status})`)
      console.log(`     Error: ${responseData.error || 'Quota exceeded'}`)
      console.log(`     Retry-After: ${configResponse.headers.get('Retry-After') || 'N/A'}`)
      break
    } else {
      console.log(`  ❌ Config ${i + 1} failed: ${key} (Status: ${configResponse.status})`)
      if (i < 3) {
        console.log(`     Error: ${JSON.stringify(responseData, null, 2)}`)
      }
    }
  }
  
  console.log(`\nSummary: ${successCount} successful, ${blockedCount} blocked\n`)
  
  // Check final usage
  const finalUsageResponse = await fetch(`${API_BASE}/api/subscription/usage`, {
    headers: {
      'Authorization': token
    }
  })
  
  const finalUsageData = await finalUsageResponse.json()
  const finalBusinessConfigUsage = finalUsageData.usage?.businessConfigKeys || { used: 0, limit: null, percentage: 0 }
  
  console.log('Final Business Config Keys Usage:')
  console.log(`  Used: ${finalBusinessConfigUsage.used}/${finalBusinessConfigUsage.limit || 'unlimited'} (${finalBusinessConfigUsage.percentage.toFixed(1)}%)`)
  
  console.log('\n=== Test Complete ===\n')
}

testBusinessConfigQuota().catch(console.error)
