const API_BASE = 'http://localhost:3000'

async function checkPlanLimits() {
  console.log('\n=== Checking Plan Limits ===\n')
  
  // Get plans
  const plansResponse = await fetch(`${API_BASE}/api/plans`, {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWpvaTJrOGEwMDAwOXowOTU1NWo2cmg5IiwiaWF0IjoxNzY2ODUyMDE1LCJleHAiOjE3Njc0NTY4MTV9.0r1-Z1hB0ywxAiePWIxm7kAf8CdqGJazBG-DKBtimAQ'
    }
  })
  
  const plansData = await plansResponse.json()
  const freePlan = plansData.plans?.find((p: any) => p.name === 'free')
  
  if (freePlan) {
    console.log('Free Plan Limits:')
    console.log(`  Max Devices: ${freePlan.maxDevices ?? 'unlimited'}`)
    console.log(`  Max API Requests: ${freePlan.maxApiRequests ?? 'unlimited'}`)
    console.log(`  Max API Endpoints: ${freePlan.maxApiEndpoints ?? 'unlimited'}`)
    console.log(`  Max Sessions: ${freePlan.maxSessions ?? 'unlimited'}`)
    console.log(`  Max Logs: ${freePlan.maxLogs ?? 'unlimited'}`)
    console.log(`  Max Crashes: ${freePlan.maxCrashes ?? 'unlimited'}`)
  } else {
    console.log('Free plan not found')
  }
  
  // Get current subscription
  const subscriptionResponse = await fetch(`${API_BASE}/api/subscription`, {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWpvaTJrOGEwMDAwOXowOTU1NWo2cmg5IiwiaWF0IjoxNzY2ODUyMDE1LCJleHAiOjE3Njc0NTY4MTV9.0r1-Z1hB0ywxAiePWIxm7kAf8CdqGJazBG-DKBtimAQ'
    }
  })
  
  const subscriptionData = await subscriptionResponse.json()
  console.log('\nCurrent Subscription:')
  console.log(`  Plan: ${subscriptionData.subscription?.plan?.name}`)
  console.log(`  Plan Display: ${subscriptionData.subscription?.plan?.displayName}`)
}

checkPlanLimits().catch(console.error)
