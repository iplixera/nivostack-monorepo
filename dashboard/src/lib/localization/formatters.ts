/**
 * Localization File Formatters
 * Converts translations to CSV, JSON, Android XML, iOS strings, and XLIFF formats
 */

export interface Translation {
  key: string
  value: string
  description?: string
  category?: string
}

export interface Language {
  code: string
  name: string
}

/**
 * Format translations as CSV
 */
export function formatCSV(translations: Translation[]): string {
  const lines: string[] = ['key,value,description,category']
  
  for (const t of translations) {
    const key = escapeCSV(t.key)
    const value = escapeCSV(t.value)
    const description = t.description ? escapeCSV(t.description) : ''
    const category = t.category ? escapeCSV(t.category) : ''
    
    lines.push(`${key},${value},${description},${category}`)
  }
  
  return lines.join('\n')
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Format translations as JSON (nested structure)
 */
export function formatJSON(translations: Translation[]): Record<string, string> {
  const result: Record<string, string> = {}
  
  for (const t of translations) {
    // Support nested keys like "section.subsection.key"
    const parts = t.key.split('.')
    let current: any = result
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!current[part]) {
        current[part] = {}
      }
      current = current[part]
    }
    
    current[parts[parts.length - 1]] = t.value
  }
  
  return result
}

/**
 * Format translations as Android XML strings
 */
export function formatAndroidXML(translations: Translation[], languageCode?: string): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<resources>',
  ]
  
  for (const t of translations) {
    const key = escapeXML(t.key)
    const value = escapeXML(t.value)
    lines.push(`    <string name="${key}">${value}</string>`)
  }
  
  lines.push('</resources>')
  return lines.join('\n')
}

function escapeXML(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Format translations as iOS .strings file
 */
export function formatIOSStrings(translations: Translation[]): string {
  const lines: string[] = []
  
  // Group by category if available
  const byCategory = new Map<string, Translation[]>()
  const uncategorized: Translation[] = []
  
  for (const t of translations) {
    if (t.category) {
      if (!byCategory.has(t.category)) {
        byCategory.set(t.category, [])
      }
      byCategory.get(t.category)!.push(t)
    } else {
      uncategorized.push(t)
    }
  }
  
  // Write categorized translations
  for (const [category, items] of byCategory.entries()) {
    lines.push(`/* ${category} */`)
    for (const t of items) {
      const key = escapeIOSString(t.key)
      const value = escapeIOSString(t.value)
      lines.push(`"${key}" = "${value}";`)
    }
    lines.push('')
  }
  
  // Write uncategorized translations
  if (uncategorized.length > 0) {
    if (byCategory.size > 0) {
      lines.push('/* Uncategorized */')
    }
    for (const t of uncategorized) {
      const key = escapeIOSString(t.key)
      const value = escapeIOSString(t.value)
      lines.push(`"${key}" = "${value}";`)
    }
  }
  
  return lines.join('\n')
}

function escapeIOSString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t')
}

/**
 * Format translations as XLIFF
 */
export function formatXLIFF(
  translations: Translation[],
  sourceLanguage: Language,
  targetLanguage: Language
): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0">`,
    `  <file original="app" source-language="${sourceLanguage.code}" target-language="${targetLanguage.code}">`,
    '    <body>',
  ]
  
  for (const t of translations) {
    const key = escapeXML(t.key)
    const value = escapeXML(t.value)
    
    lines.push(`      <unit id="${key}">`)
    lines.push('        <segment>')
    lines.push(`          <source>${value}</source>`)
    lines.push(`          <target>${value}</target>`)
    lines.push('        </segment>')
    lines.push('      </unit>')
  }
  
  lines.push('    </body>')
  lines.push('  </file>')
  lines.push('</xliff>')
  
  return lines.join('\n')
}

/**
 * Main formatter function
 */
export function formatFile(
  translations: Translation[],
  format: 'csv' | 'json' | 'android_xml' | 'ios_strings' | 'xliff',
  options?: {
    sourceLanguage?: Language
    targetLanguage?: Language
  }
): string {
  switch (format) {
    case 'csv':
      return formatCSV(translations)
    case 'json':
      return JSON.stringify(formatJSON(translations), null, 2)
    case 'android_xml':
      return formatAndroidXML(translations)
    case 'ios_strings':
      return formatIOSStrings(translations)
    case 'xliff':
      if (!options?.sourceLanguage || !options?.targetLanguage) {
        throw new Error('XLIFF format requires sourceLanguage and targetLanguage')
      }
      return formatXLIFF(translations, options.sourceLanguage, options.targetLanguage)
    default:
      throw new Error(`Unsupported format: ${format}`)
  }
}

