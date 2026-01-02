import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addMeaningfulTranslations() {
  console.log('\n=== Adding Meaningful Translations ===\n')
  
  try {
    // Get a project (use the first one)
    const project = await prisma.project.findFirst()
    if (!project) {
      console.error('❌ No project found')
      return
    }
    
    console.log(`Project: ${project.name} (${project.id})\n`)
    
    // Get or create English language
    let englishLang = await prisma.language.findFirst({
      where: { projectId: project.id, code: 'en' }
    })
    
    if (!englishLang) {
      englishLang = await prisma.language.create({
        data: {
          projectId: project.id,
          code: 'en',
          name: 'English',
          nativeName: 'English',
          isDefault: true,
          isEnabled: true,
          isRTL: false
        }
      })
      console.log('✅ Created English language')
    } else {
      console.log('✅ English language exists')
    }
    
    // Get or create Arabic language
    let arabicLang = await prisma.language.findFirst({
      where: { projectId: project.id, code: 'ar' }
    })
    
    if (!arabicLang) {
      arabicLang = await prisma.language.create({
        data: {
          projectId: project.id,
          code: 'ar',
          name: 'Arabic',
          nativeName: 'العربية',
          isDefault: false,
          isEnabled: true,
          isRTL: true
        }
      })
      console.log('✅ Created Arabic language')
    } else {
      console.log('✅ Arabic language exists')
    }
    
    // Define meaningful translations
    const translations = [
      {
        key: 'welcome.title',
        description: 'Welcome screen title',
        category: 'ui',
        en: 'Welcome to DevBridge',
        ar: 'مرحباً بك في DevBridge'
      },
      {
        key: 'welcome.subtitle',
        description: 'Welcome screen subtitle',
        category: 'ui',
        en: 'Build amazing mobile apps with confidence',
        ar: 'قم ببناء تطبيقات الهاتف المحمول الرائعة بثقة'
      },
      {
        key: 'button.save',
        description: 'Save button label',
        category: 'ui',
        en: 'Save',
        ar: 'حفظ'
      },
      {
        key: 'button.cancel',
        description: 'Cancel button label',
        category: 'ui',
        en: 'Cancel',
        ar: 'إلغاء'
      },
      {
        key: 'button.submit',
        description: 'Submit button label',
        category: 'ui',
        en: 'Submit',
        ar: 'إرسال'
      },
      {
        key: 'error.network',
        description: 'Network error message',
        category: 'errors',
        en: 'Network connection error. Please check your internet connection.',
        ar: 'خطأ في الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت الخاص بك.'
      },
      {
        key: 'error.generic',
        description: 'Generic error message',
        category: 'errors',
        en: 'An error occurred. Please try again.',
        ar: 'حدث خطأ. يرجى المحاولة مرة أخرى.'
      },
      {
        key: 'success.saved',
        description: 'Success message when data is saved',
        category: 'messages',
        en: 'Data saved successfully',
        ar: 'تم حفظ البيانات بنجاح'
      },
      {
        key: 'form.email.label',
        description: 'Email input label',
        category: 'forms',
        en: 'Email Address',
        ar: 'عنوان البريد الإلكتروني'
      },
      {
        key: 'form.password.label',
        description: 'Password input label',
        category: 'forms',
        en: 'Password',
        ar: 'كلمة المرور'
      }
    ]
    
    console.log(`\nAdding ${translations.length} translation keys...\n`)
    
    for (const trans of translations) {
      // Create or get the key
      let key = await prisma.localizationKey.findFirst({
        where: {
          projectId: project.id,
          key: trans.key
        }
      })
      
      if (!key) {
        key = await prisma.localizationKey.create({
          data: {
            projectId: project.id,
            key: trans.key,
            description: trans.description,
            category: trans.category
          }
        })
        console.log(`✅ Created key: ${trans.key}`)
      } else {
        console.log(`ℹ️  Key exists: ${trans.key}`)
      }
      
      // Add English translation
      await prisma.translation.upsert({
        where: {
          keyId_languageId: {
            keyId: key.id,
            languageId: englishLang.id
          }
        },
        update: {
          value: trans.en
        },
        create: {
          projectId: project.id,
          keyId: key.id,
          languageId: englishLang.id,
          value: trans.en
        }
      })
      
      // Add Arabic translation
      await prisma.translation.upsert({
        where: {
          keyId_languageId: {
            keyId: key.id,
            languageId: arabicLang.id
          }
        },
        update: {
          value: trans.ar
        },
        create: {
          projectId: project.id,
          keyId: key.id,
          languageId: arabicLang.id,
          value: trans.ar
        }
      })
      
      console.log(`   ✓ Added translations for ${trans.key}`)
    }
    
    console.log('\n✅ All translations added successfully!\n')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addMeaningfulTranslations()
