const API_BASE = 'http://localhost:3000'

async function testLocalizationQuota() {
  console.log('\n=== Testing Localization Quota Enforcement ===\n')
  
  const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWpvaTJrOGEwMDAwOXowOTU1NWo2cmg5IiwiaWF0IjoxNzY2ODUyMDE1LCJleHAiOjE3Njc0NTY4MTV9.0r1-Z1hB0ywxAiePWIxm7kAf8CdqGJazBG-DKBtimAQ'
  
  // Get project info
  const projectResponse = await fetch(`${API_BASE}/api/projects`, {
    headers: { 'Authorization': token }
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
    headers: { 'Authorization': token }
  })
  
  const usageData = await usageResponse.json()
  const languagesUsage = usageData.usage?.localizationLanguages || { used: 0, limit: null, percentage: 0 }
  const keysUsage = usageData.usage?.localizationKeys || { used: 0, limit: null, percentage: 0 }
  
  console.log('Current Localization Usage:')
  console.log(`  Languages: ${languagesUsage.used}/${languagesUsage.limit || 'unlimited'} (${languagesUsage.percentage.toFixed(1)}%)`)
  console.log(`  Keys: ${keysUsage.used}/${keysUsage.limit || 'unlimited'} (${keysUsage.percentage.toFixed(1)}%)\n`)
  
  // Test 1: Language Quota Enforcement
  console.log('=== Test 1: Language Quota Enforcement ===\n')
  
  const remainingLanguages = languagesUsage.limit ? Math.max(0, languagesUsage.limit - languagesUsage.used) : 5
  const languagesToAdd = Math.min(remainingLanguages + 2, 5)
  
  console.log(`Attempting to add ${languagesToAdd} languages...\n`)
  
  const testLanguages = [
    { code: 'test1', name: 'Test Language 1', nativeName: 'Test 1', isRTL: false },
    { code: 'test2', name: 'Test Language 2', nativeName: 'Test 2', isRTL: false },
    { code: 'test3', name: 'Test Language 3', nativeName: 'Test 3', isRTL: false },
    { code: 'test4', name: 'Test Language 4', nativeName: 'Test 4', isRTL: false },
    { code: 'test5', name: 'Test Language 5', nativeName: 'Test 5', isRTL: false }
  ]
  
  let languageSuccessCount = 0
  let languageBlockedCount = 0
  
  for (let i = 0; i < languagesToAdd; i++) {
    const lang = testLanguages[i]
    const langResponse = await fetch(`${API_BASE}/api/localization/languages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        projectId: project.id,
        code: `${lang.code}_${Date.now()}`,
        name: lang.name,
        nativeName: lang.nativeName,
        isRTL: lang.isRTL
      })
    })
    
    const contentType = langResponse.headers.get('content-type') || ''
    let responseData: any
    
    if (contentType.includes('application/json')) {
      responseData = await langResponse.json()
    } else {
      const text = await langResponse.text()
      responseData = { raw: text }
    }
    
    if (langResponse.ok && !responseData.error) {
      languageSuccessCount++
      if (i < 3) {
        console.log(`  ✅ Language ${i + 1}: ${lang.name} (Status: ${langResponse.status})`)
      }
    } else if (langResponse.status === 429 || langResponse.status === 403) {
      languageBlockedCount++
      console.log(`  🚫 Language ${i + 1} BLOCKED: ${lang.name} (Status: ${langResponse.status})`)
      console.log(`     Error: ${responseData.error || 'Quota exceeded'}`)
      console.log(`     Retry-After: ${langResponse.headers.get('Retry-After') || 'N/A'}`)
      break
    } else {
      console.log(`  ❌ Language ${i + 1} failed: ${lang.name} (Status: ${langResponse.status})`)
      if (i < 3) {
        console.log(`     Error: ${JSON.stringify(responseData, null, 2)}`)
      }
    }
  }
  
  console.log(`\nLanguage Test Summary: ${languageSuccessCount} successful, ${languageBlockedCount} blocked\n`)
  
  // Test 2: Keys Quota Enforcement
  console.log('=== Test 2: Keys Quota Enforcement ===\n')
  
  // Get existing languages (need at least one language to create keys)
  const languagesRes = await fetch(`${API_BASE}/api/localization/languages?projectId=${project.id}`, {
    headers: { 'Authorization': token }
  })
  const languagesData = await languagesRes.json()
  const existingLanguages = languagesData.languages || []
  
  if (existingLanguages.length === 0) {
    console.log('⚠️  No languages available. Creating a default language first...')
    const defaultLangRes = await fetch(`${API_BASE}/api/localization/languages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        projectId: project.id,
        code: 'en',
        name: 'English',
        nativeName: 'English',
        isRTL: false,
        isDefault: true
      })
    })
    
    if (defaultLangRes.ok) {
      console.log('✅ Created default language (en)\n')
      // Refresh languages
      const refreshRes = await fetch(`${API_BASE}/api/localization/languages?projectId=${project.id}`, {
        headers: { 'Authorization': token }
      })
      const refreshData = await refreshRes.json()
      existingLanguages.push(...(refreshData.languages || []))
    }
  }
  
  if (existingLanguages.length === 0) {
    console.error('❌ Cannot test keys: No languages available')
    return
  }
  
  const defaultLanguage = existingLanguages.find((l: any) => l.isDefault) || existingLanguages[0]
  console.log(`Using language: ${defaultLanguage.name} (${defaultLanguage.code})\n`)
  
  const remainingKeys = keysUsage.limit ? Math.max(0, keysUsage.limit - keysUsage.used) : 10
  const keysToAdd = Math.min(remainingKeys + 3, 10)
  
  console.log(`Attempting to add ${keysToAdd} translation keys...\n`)
  
  let keySuccessCount = 0
  let keyBlockedCount = 0
  
  for (let i = 0; i < keysToAdd; i++) {
    const key = `test.key.${Date.now()}.${i}`
    const keyResponse = await fetch(`${API_BASE}/api/localization/keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        projectId: project.id,
        key,
        description: `Test key ${i + 1}`,
        category: 'test',
        translations: [{
          languageId: defaultLanguage.id,
          value: `Test value ${i + 1}`
        }]
      })
    })
    
    const contentType = keyResponse.headers.get('content-type') || ''
    let responseData: any
    
    if (contentType.includes('application/json')) {
      responseData = await keyResponse.json()
    } else {
      const text = await keyResponse.text()
      responseData = { raw: text }
    }
    
    if (keyResponse.ok && !responseData.error) {
      keySuccessCount++
      if (i < 3) {
        console.log(`  ✅ Key ${i + 1}: ${key} (Status: ${keyResponse.status})`)
      }
    } else if (keyResponse.status === 429 || keyResponse.status === 403) {
      keyBlockedCount++
      console.log(`  🚫 Key ${i + 1} BLOCKED: ${key} (Status: ${keyResponse.status})`)
      console.log(`     Error: ${responseData.error || 'Quota exceeded'}`)
      console.log(`     Retry-After: ${keyResponse.headers.get('Retry-After') || 'N/A'}`)
      break
    } else {
      console.log(`  ❌ Key ${i + 1} failed: ${key} (Status: ${keyResponse.status})`)
      if (i < 3) {
        console.log(`     Error: ${JSON.stringify(responseData, null, 2)}`)
      }
    }
  }
  
  console.log(`\nKeys Test Summary: ${keySuccessCount} successful, ${keyBlockedCount} blocked\n`)
  
  // Check final usage
  const finalUsageResponse = await fetch(`${API_BASE}/api/subscription/usage`, {
    headers: { 'Authorization': token }
  })
  
  const finalUsageData = await finalUsageResponse.json()
  const finalLanguagesUsage = finalUsageData.usage?.localizationLanguages || { used: 0, limit: null, percentage: 0 }
  const finalKeysUsage = finalUsageData.usage?.localizationKeys || { used: 0, limit: null, percentage: 0 }
  
  console.log('Final Localization Usage:')
  console.log(`  Languages: ${finalLanguagesUsage.used}/${finalLanguagesUsage.limit || 'unlimited'} (${finalLanguagesUsage.percentage.toFixed(1)}%)`)
  console.log(`  Keys: ${finalKeysUsage.used}/${finalKeysUsage.limit || 'unlimited'} (${finalKeysUsage.percentage.toFixed(1)}%)`)
  
  console.log('\n=== Test Complete ===\n')
}

testLocalizationQuota().catch(console.error)
