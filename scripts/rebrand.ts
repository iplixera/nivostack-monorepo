#!/usr/bin/env tsx
/**
 * NivoStack Rebranding Script
 * 
 * This script performs bulk find/replace operations for the DevBridge -> NivoStack rebrand.
 * Run with: tsx scripts/rebrand.ts
 * 
 * WARNING: This script modifies files in place. Make sure you have a backup or are in a git branch.
 */

import { readFileSync, writeFileSync } from 'fs'
import { glob } from 'glob'
import { join } from 'path'

const REPLACEMENTS: Array<[RegExp, string]> = [
  // Brand names (case-sensitive)
  [/DevBridge/g, 'NivoStack'],
  [/devbridge/g, 'nivostack'],
  [/DEVBRIDGE/g, 'NIVOSTACK'],
  
  // Specific UI text
  [/DevBridge Studio/g, 'NivoStack Studio'],
  [/DevBridge Console/g, 'NivoStack Studio'],
  [/DevBridge Dashboard/g, 'NivoStack Studio'],
  [/DevBridge SDK/g, 'NivoStack Core SDK'],
  [/DevBridge Settings/g, 'NivoStack Settings'],
  
  // Package names
  [/devbridge_sdk/g, '@nivostack/core'],
  [/devbridge-sdk/g, '@nivostack/core'],
  [/@devbridge\//g, '@nivostack/'],
  
  // Domain/hostname patterns (be careful with these - may need manual review)
  [/devbridge\.vercel\.app/g, 'studio.nivostack.com'],
  [/devbridge-eta\.vercel\.app/g, 'studio.nivostack.com'],
  [/devbridge\.com/g, 'nivostack.com'],
  [/devbridge\.dev/g, 'nivostack.com'],
  
  // Class/function names (if used in code)
  [/class DevBridge/g, 'class NivoStack'],
  [/DevBridge\./g, 'NivoStack.'],
  [/DevBridge\(/g, 'NivoStack('],
  
  // Environment variables
  [/DEVBRIDGE_/g, 'NIVOSTACK_'],
  [/devbridge_/g, 'nivostack_'],
]

// Files to exclude from bulk replacement
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/.next/**',
  '**/dist/**',
  '**/build/**',
  '**/.git/**',
  '**/scripts/rebrand.ts', // Don't rebrand this script itself
  '**/REBRAND_SUMMARY.md', // Don't rebrand the summary
]

// File extensions to process
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.yaml', '.yml', '.sh']

async function rebrandFile(filePath: string): Promise<{ changed: boolean; replacements: number }> {
  try {
    const content = readFileSync(filePath, 'utf-8')
    let newContent = content
    let totalReplacements = 0
    
    for (const [pattern, replacement] of REPLACEMENTS) {
      const matches = newContent.match(pattern)
      if (matches) {
        newContent = newContent.replace(pattern, replacement)
        totalReplacements += matches.length
      }
    }
    
    if (newContent !== content) {
      writeFileSync(filePath, newContent, 'utf-8')
      return { changed: true, replacements: totalReplacements }
    }
    
    return { changed: false, replacements: 0 }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error)
    return { changed: false, replacements: 0 }
  }
}

async function main() {
  console.log('🚀 Starting NivoStack rebranding...\n')
  
  const files: string[] = []
  for (const ext of FILE_EXTENSIONS) {
    const pattern = `**/*${ext}`
    const matches = await glob(pattern, {
      ignore: EXCLUDE_PATTERNS,
      cwd: process.cwd(),
    })
    files.push(...matches)
  }
  
  console.log(`Found ${files.length} files to process\n`)
  
  let totalChanged = 0
  let totalReplacements = 0
  
  for (const file of files) {
    const result = await rebrandFile(file)
    if (result.changed) {
      totalChanged++
      totalReplacements += result.replacements
      console.log(`✓ ${file} (${result.replacements} replacements)`)
    }
  }
  
  console.log(`\n✅ Rebranding complete!`)
  console.log(`   Files changed: ${totalChanged}`)
  console.log(`   Total replacements: ${totalReplacements}`)
  console.log(`\n⚠️  Please review the changes and test thoroughly!`)
}

if (require.main === module) {
  main().catch(console.error)
}

export { rebrandFile, REPLACEMENTS }

