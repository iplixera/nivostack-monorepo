import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupTestLanguages() {
  console.log('\n=== Cleaning Up Test Languages ===\n')
  
  try {
    // Get a project
    const project = await prisma.project.findFirst()
    if (!project) {
      console.error('❌ No project found')
      return
    }
    
    console.log(`Project: ${project.name} (${project.id})\n`)
    
    // Get all languages
    const languages = await prisma.language.findMany({
      where: { projectId: project.id }
    })
    
    console.log(`Found ${languages.length} languages:`)
    languages.forEach(lang => {
      console.log(`  - ${lang.code} (${lang.name})`)
    })
    
    // Keep only 'en' and 'ar', delete the rest
    const languagesToDelete = languages.filter(lang => lang.code !== 'en' && lang.code !== 'ar')
    
    if (languagesToDelete.length === 0) {
      console.log('\n✅ No test languages to delete. Only English and Arabic exist.\n')
      return
    }
    
    console.log(`\nDeleting ${languagesToDelete.length} test language(s)...\n`)
    
    for (const lang of languagesToDelete) {
      // Delete translations first (cascade should handle this, but being explicit)
      const translationCount = await prisma.translation.count({
        where: { languageId: lang.id }
      })
      
      await prisma.translation.deleteMany({
        where: { languageId: lang.id }
      })
      
      // Delete the language
      await prisma.language.delete({
        where: { id: lang.id }
      })
      
      console.log(`✅ Deleted language: ${lang.code} (${lang.name}) - removed ${translationCount} translations`)
    }
    
    console.log('\n✅ Cleanup complete!\n')
    
    // Show remaining languages
    const remainingLanguages = await prisma.language.findMany({
      where: { projectId: project.id }
    })
    
    console.log(`Remaining languages (${remainingLanguages.length}):`)
    remainingLanguages.forEach(lang => {
      console.log(`  - ${lang.code} (${lang.name}) - ${lang.isDefault ? 'Default' : ''}`)
    })
    console.log()
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupTestLanguages()
