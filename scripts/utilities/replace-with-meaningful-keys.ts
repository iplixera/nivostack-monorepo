import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function replaceWithMeaningfulKeys() {
  console.log('\n=== Replacing Test Keys with Meaningful Translations ===\n')
  
  try {
    // Get a project
    const project = await prisma.project.findFirst()
    if (!project) {
      console.error('❌ No project found')
      return
    }
    
    // Get languages
    const englishLang = await prisma.language.findFirst({
      where: { projectId: project.id, code: 'en' }
    })
    
    const arabicLang = await prisma.language.findFirst({
      where: { projectId: project.id, code: 'ar' }
    })
    
    if (!englishLang || !arabicLang) {
      console.error('❌ Languages not found')
      return
    }
    
    // Get current keys
    const currentKeys = await prisma.localizationKey.findMany({
      where: { projectId: project.id }
    })
    
    console.log(`Current keys: ${currentKeys.length}`)
    
    // Delete all current keys and their translations
    for (const key of currentKeys) {
      await prisma.translation.deleteMany({
        where: { keyId: key.id }
      })
      await prisma.localizationKey.delete({
        where: { id: key.id }
      })
    }
    
    console.log('✅ Deleted all existing keys\n')
    
    // Add 2 meaningful keys with translations
    const meaningfulKeys = [
      {
        key: 'welcome.title',
        description: 'Welcome screen title',
        category: 'ui',
        en: 'Welcome to DevBridge',
        ar: 'مرحباً بك في DevBridge'
      },
      {
        key: 'button.save',
        description: 'Save button label',
        category: 'ui',
        en: 'Save',
        ar: 'حفظ'
      }
    ]
    
    for (const trans of meaningfulKeys) {
      // Create the key
      const key = await prisma.localizationKey.create({
        data: {
          projectId: project.id,
          key: trans.key,
          description: trans.description,
          category: trans.category
        }
      })
      
      // Add English translation
      await prisma.translation.create({
        data: {
          projectId: project.id,
          keyId: key.id,
          languageId: englishLang.id,
          value: trans.en
        }
      })
      
      // Add Arabic translation
      await prisma.translation.create({
        data: {
          projectId: project.id,
          keyId: key.id,
          languageId: arabicLang.id,
          value: trans.ar
        }
      })
      
      console.log(`✅ Created: ${trans.key}`)
      console.log(`   EN: ${trans.en}`)
      console.log(`   AR: ${trans.ar}\n`)
    }
    
    const finalCount = await prisma.localizationKey.count({
      where: { projectId: project.id }
    })
    
    console.log(`✅ Complete! Final count: ${finalCount}/2\n`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

replaceWithMeaningfulKeys()
