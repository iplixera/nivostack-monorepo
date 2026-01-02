#!/usr/bin/env tsx
/**
 * Script to measure API call patterns and performance
 * 
 * Usage:
 *   pnpm tsx scripts/measure-api-calls.ts
 * 
 * This script analyzes the codebase to identify:
 * - API calls made on page load
 * - API calls made per tab switch
 * - Duplicate API calls
 * - Potential optimizations
 */

import { readFileSync } from 'fs'
import { join } from 'path'

const PROJECT_ROOT = join(__dirname, '..')
const PAGE_FILE = join(PROJECT_ROOT, 'src/app/(dashboard)/projects/[id]/page.tsx')

interface ApiCall {
  line: number
  method: string
  endpoint: string
  context: string
  trigger: 'initial' | 'tab-switch' | 'user-action' | 'component-mount'
}

function analyzeApiCalls(): void {
  console.log('\n=== API Call Analysis ===\n')
  
  const content = readFileSync(PAGE_FILE, 'utf-8')
  const lines = content.split('\n')
  
  const apiCalls: ApiCall[] = []
  let currentContext = 'root'
  let inInitialFetch = false
  let inUseEffect = false
  let currentTab = ''
  
  lines.forEach((line, index) => {
    const lineNum = index + 1
    
    // Detect initial fetch block
    if (line.includes('const fetchData = async') || line.includes('await Promise.all([')) {
      inInitialFetch = true
      currentContext = 'initial-fetch'
    }
    
    if (inInitialFetch && line.includes('])')) {
      inInitialFetch = false
    }
    
    // Detect useEffect blocks
    if (line.includes('useEffect(() =>')) {
      inUseEffect = true
      if (line.includes('activeTab')) {
        const tabMatch = line.match(/activeTab === ['"]([^'"]+)['"]/)
        if (tabMatch) {
          currentTab = tabMatch[1]
          currentContext = `tab-${currentTab}`
        }
      }
    }
    
    if (inUseEffect && line.includes('}, [')) {
      inUseEffect = false
      currentContext = 'root'
      currentTab = ''
    }
    
    // Detect API calls
    const apiPatterns = [
      { pattern: /api\.devices\.list\(/, name: 'devices.list', endpoint: '/api/devices' },
      { pattern: /api\.logs\.list\(/, name: 'logs.list', endpoint: '/api/logs' },
      { pattern: /api\.crashes\.list\(/, name: 'crashes.list', endpoint: '/api/crashes' },
      { pattern: /api\.traces\.list\(/, name: 'traces.list', endpoint: '/api/traces' },
      { pattern: /api\.projects\.list\(/, name: 'projects.list', endpoint: '/api/projects' },
      { pattern: /api\.alerts\.list\(/, name: 'alerts.list', endpoint: '/api/alerts' },
      { pattern: /api\.subscription\.getUsage\(/, name: 'subscription.getUsage', endpoint: '/api/subscription/usage' },
      { pattern: /api\.subscription\.getEnforcement\(/, name: 'subscription.getEnforcement', endpoint: '/api/subscription/enforcement' },
      { pattern: /api\.businessConfig\.list\(/, name: 'businessConfig.list', endpoint: '/api/business-config' },
      { pattern: /api\.localization\.getLanguages\(/, name: 'localization.getLanguages', endpoint: '/api/localization/languages' },
      { pattern: /api\.localization\.getKeys\(/, name: 'localization.getKeys', endpoint: '/api/localization/keys' },
      { pattern: /\/api\/sdk-settings/, name: 'sdk-settings', endpoint: '/api/sdk-settings' },
      { pattern: /\/api\/config-categories/, name: 'config-categories', endpoint: '/api/config-categories' },
    ]
    
    apiPatterns.forEach(({ pattern, name, endpoint }) => {
      if (pattern.test(line)) {
        let trigger: ApiCall['trigger'] = 'user-action'
        if (inInitialFetch) {
          trigger = 'initial'
        } else if (inUseEffect && currentTab) {
          trigger = 'tab-switch'
        } else if (inUseEffect) {
          trigger = 'component-mount'
        }
        
        apiCalls.push({
          line: lineNum,
          method: name,
          endpoint,
          context: currentContext,
          trigger
        })
      }
    })
  })
  
  // Group by trigger
  const byTrigger = apiCalls.reduce((acc, call) => {
    if (!acc[call.trigger]) acc[call.trigger] = []
    acc[call.trigger].push(call)
    return acc
  }, {} as Record<string, ApiCall[]>)
  
  console.log('📊 API Calls by Trigger:\n')
  
  Object.entries(byTrigger).forEach(([trigger, calls]) => {
    console.log(`${trigger.toUpperCase()}: ${calls.length} calls`)
    calls.forEach(call => {
      console.log(`  - Line ${call.line}: ${call.method} (${call.endpoint})`)
    })
    console.log()
  })
  
  // Find duplicates
  const duplicates = apiCalls.filter((call, index, self) => 
    self.findIndex(c => c.method === call.method && c.trigger === call.trigger) !== index
  )
  
  if (duplicates.length > 0) {
    console.log('⚠️  Duplicate API Calls Found:\n')
    duplicates.forEach(call => {
      console.log(`  - ${call.method} called multiple times (trigger: ${call.trigger})`)
    })
    console.log()
  }
  
  // Recommendations
  console.log('💡 Recommendations:\n')
  
  const initialCalls = byTrigger.initial?.length || 0
  if (initialCalls > 5) {
    console.log(`  ⚠️  Too many API calls on initial load (${initialCalls}). Consider lazy loading.`)
  }
  
  const usageCalls = apiCalls.filter(c => c.method === 'subscription.getUsage').length
  if (usageCalls > 1) {
    console.log(`  ⚠️  getUsage() called ${usageCalls} times. Consider fetching once and sharing.`)
  }
  
  const enforcementCalls = apiCalls.filter(c => c.method === 'subscription.getEnforcement').length
  if (enforcementCalls > 1) {
    console.log(`  ⚠️  getEnforcement() called ${enforcementCalls} times. Consider fetching once and sharing.`)
  }
  
  console.log('\n✅ Analysis complete!\n')
}

try {
  analyzeApiCalls()
} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}

