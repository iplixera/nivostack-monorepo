/**
 * Localization File Parsers
 * Supports CSV, JSON, Android XML, iOS strings, and XLIFF formats
 */

export interface ParsedTranslation {
  key: string
  value: string
  description?: string
  category?: string
}

export interface ParseResult {
  translations: ParsedTranslation[]
  errors: Array<{ row?: number; message: string }>
}

/**
 * Parse CSV file
 * Expected format: key,value,description,category
 */
export function parseCSV(content: string): ParseResult {
  const translations: ParsedTranslation[] = []
  const errors: Array<{ row?: number; message: string }> = []
  
  const lines = content.split('\n').filter(line => line.trim())
  
  // Skip header row if present
  const startIndex = lines[0]?.includes('key') ? 1 : 0
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue
    
    try {
      // Handle CSV with quoted values
      const parts = parseCSVLine(line)
      
      if (parts.length < 2) {
        errors.push({ row: i + 1, message: 'Invalid CSV format: expected at least key and value' })
        continue
      }
      
      translations.push({
        key: parts[0].trim(),
        value: parts[1].trim(),
        description: parts[2]?.trim() || undefined,
        category: parts[3]?.trim() || undefined,
      })
    } catch (error) {
      errors.push({ row: i + 1, message: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}` })
    }
  }
  
  return { translations, errors }
}

/**
 * Parse CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i++
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current)
  return result
}

/**
 * Parse JSON file
 * Supports flat format: { "key": "value" }
 * And nested format: { "section": { "key": "value" } }
 */
export function parseJSON(content: string): ParseResult {
  const translations: ParsedTranslation[] = []
  const errors: Array<{ row?: number; message: string }> = []
  
  try {
    const data = JSON.parse(content)
    
    function flatten(obj: any, prefix = ''): void {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const fullKey = prefix ? `${prefix}.${key}` : key
          const value = obj[key]
          
          if (typeof value === 'string') {
            translations.push({
              key: fullKey,
              value: value,
            })
          } else if (typeof value === 'object' && value !== null) {
            flatten(value, fullKey)
          }
        }
      }
    }
    
    flatten(data)
  } catch (error) {
    errors.push({ message: `JSON parse error: ${error instanceof Error ? error.message : 'Invalid JSON'}` })
  }
  
  return { translations, errors }
}

/**
 * Parse Android XML strings file
 * Format: <string name="key">value</string>
 */
export function parseAndroidXML(content: string): ParseResult {
  const translations: ParsedTranslation[] = []
  const errors: Array<{ row?: number; message: string }> = []
  
  try {
    // Simple regex-based parser (for production, consider using xml2js)
    const stringRegex = /<string\s+name=["']([^"']+)["'](?:\s+[^>]*)?>([\s\S]*?)<\/string>/g
    
    let match
    while ((match = stringRegex.exec(content)) !== null) {
      const key = match[1]
      let value = match[2]
      
      // Handle CDATA
      if (value.includes('<![CDATA[')) {
        value = value.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
      }
      
      // Decode XML entities
      value = value
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .trim()
      
      translations.push({
        key: key,
        value: value,
      })
    }
  } catch (error) {
    errors.push({ message: `XML parse error: ${error instanceof Error ? error.message : 'Invalid XML'}` })
  }
  
  return { translations, errors }
}

/**
 * Parse iOS .strings file
 * Format: "key" = "value";
 */
export function parseIOSStrings(content: string): ParseResult {
  const translations: ParsedTranslation[] = []
  const errors: Array<{ row?: number; message: string }> = []
  
  const lines = content.split('\n')
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Skip comments and empty lines
    if (!line || line.startsWith('//') || line.startsWith('/*')) {
      continue
    }
    
    try {
      // Match: "key" = "value";
      const match = line.match(/^"([^"]+)"\s*=\s*"([^"]*)"\s*;?$/)
      
      if (match) {
        const key = match[1]
        let value = match[2]
        
        // Handle escaped quotes and newlines
        value = value
          .replace(/\\"/g, '"')
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\\\/g, '\\')
        
        translations.push({
          key: key,
          value: value,
        })
      }
    } catch (error) {
      errors.push({ row: i + 1, message: `Parse error: ${error instanceof Error ? error.message : 'Invalid format'}` })
    }
  }
  
  return { translations, errors }
}

/**
 * Parse XLIFF file
 * Format: <unit id="key"><segment><source>...</source><target>...</target></segment></unit>
 */
export function parseXLIFF(content: string): ParseResult {
  const translations: ParsedTranslation[] = []
  const errors: Array<{ row?: number; message: string }> = []
  
  try {
    // Simple regex-based parser (for production, consider using xml2js)
    const unitRegex = /<unit\s+id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/unit>/g
    
    let match
    while ((match = unitRegex.exec(content)) !== null) {
      const key = match[1]
      const unitContent = match[2]
      
      // Extract target translation (prefer target over source)
      const targetMatch = unitContent.match(/<target[^>]*>([\s\S]*?)<\/target>/)
      const sourceMatch = unitContent.match(/<source[^>]*>([\s\S]*?)<\/source>/)
      
      const value = targetMatch ? targetMatch[1] : (sourceMatch ? sourceMatch[1] : '')
      
      if (value) {
        // Decode XML entities
        const decodedValue = value
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .trim()
        
        translations.push({
          key: key,
          value: decodedValue,
        })
      }
    }
  } catch (error) {
    errors.push({ message: `XLIFF parse error: ${error instanceof Error ? error.message : 'Invalid XLIFF'}` })
  }
  
  return { translations, errors }
}

/**
 * Main parser function that routes to appropriate parser
 */
export function parseFile(content: string, format: 'csv' | 'json' | 'android_xml' | 'ios_strings' | 'xliff'): ParseResult {
  switch (format) {
    case 'csv':
      return parseCSV(content)
    case 'json':
      return parseJSON(content)
    case 'android_xml':
      return parseAndroidXML(content)
    case 'ios_strings':
      return parseIOSStrings(content)
    case 'xliff':
      return parseXLIFF(content)
    default:
      return {
        translations: [],
        errors: [{ message: `Unsupported format: ${format}` }],
      }
  }
}

