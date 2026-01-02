import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Starting database cleanup...')
  console.log('This will delete all test data except admin user and free plan\n')

  // Step 1: Delete all subscriptions (they will cascade delete invoices)
  console.log('1. Deleting all subscriptions...')
  const deletedSubscriptions = await prisma.subscription.deleteMany({})
  console.log(`   ✅ Deleted ${deletedSubscriptions.count} subscriptions`)

  // Step 2: Delete all test plans (keep only free plan)
  console.log('\n2. Deleting test plans (keeping free plan)...')
  const freePlan = await prisma.plan.findFirst({
    where: { name: 'free' },
  })

  if (!freePlan) {
    console.log('   ⚠️  Free plan not found. Creating it...')
    await prisma.plan.create({
      data: {
        name: 'free',
        displayName: 'Free Plan',
        description: 'Free plan with basic features',
        price: 0,
        currency: 'USD',
        interval: 'month',
        isActive: true,
        isPublic: true,
        maxDevices: 100,
        maxApiTraces: 1000,
        maxLogs: 10000,
        maxSessions: 1000,
        maxCrashes: 100,
        retentionDays: 30,
        allowApiTracking: true,
        allowScreenTracking: true,
        allowCrashReporting: true,
        allowLogging: true,
        allowBusinessConfig: true,
        allowLocalization: true,
      },
    })
    console.log('   ✅ Created free plan')
  }

  const deletedPlans = await prisma.plan.deleteMany({
    where: {
      name: { not: 'free' },
    },
  })
  console.log(`   ✅ Deleted ${deletedPlans.count} test plans`)

  // Step 3: Delete all test users (keep only one admin)
  console.log('\n3. Deleting test users (keeping one admin)...')
  const adminUsers = await prisma.user.findMany({
    where: { isAdmin: true },
    orderBy: { createdAt: 'asc' }, // Keep the oldest admin
  })

  // Keep only the first admin user, delete others
  if (adminUsers.length > 1) {
    const adminToKeep = adminUsers[0]
    const adminsToDelete = adminUsers.slice(1)
    await prisma.user.deleteMany({
      where: {
        id: { in: adminsToDelete.map(a => a.id) },
      },
    })
    console.log(`   ✅ Kept admin user: ${adminToKeep.email}, deleted ${adminsToDelete.length} duplicate admin(s)`)
  } else if (adminUsers.length === 0) {
    console.log('   ⚠️  Admin user not found. Creating it...')
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    await prisma.user.create({
      data: {
        email: 'admin@devbridge.com',
        name: 'DevBridge Admin',
        password: hashedPassword,
        isAdmin: true,
      },
    })
    console.log('   ✅ Created admin user (email: admin@devbridge.com, password: admin123)')
  } else {
    console.log(`   ✅ Admin user exists: ${adminUsers[0].email}`)
  }

  const deletedUsers = await prisma.user.deleteMany({
    where: {
      isAdmin: false,
    },
  })
  console.log(`   ✅ Deleted ${deletedUsers.count} test users`)

  // Step 4: Delete all projects (they cascade delete devices, sessions, logs, traces, crashes, etc.)
  console.log('\n4. Deleting all projects and related data...')
  const deletedProjects = await prisma.project.deleteMany({})
  console.log(`   ✅ Deleted ${deletedProjects.count} projects (and all related data)`)

  // Step 5: Delete all promo codes (if model exists)
  console.log('\n5. Cleaning up promo codes...')
  try {
    const deletedPromoCodes = await (prisma as any).promoCode?.deleteMany({}) || { count: 0 }
    console.log(`   ✅ Deleted ${deletedPromoCodes.count} promo codes`)
  } catch (e) {
    console.log('   ⚠️  PromoCode model not found, skipping...')
  }

  // Step 6: Delete all offers (if model exists)
  console.log('\n6. Cleaning up offers...')
  try {
    const deletedOffers = await (prisma as any).offer?.deleteMany({}) || { count: 0 }
    console.log(`   ✅ Deleted ${deletedOffers.count} offers`)
  } catch (e) {
    console.log('   ⚠️  Offer model not found, skipping...')
  }

  // Step 7: Delete all business configs (if any exist)
  console.log('\n7. Cleaning up business configs...')
  const deletedConfigs = await prisma.businessConfig.deleteMany({})
  console.log(`   ✅ Deleted ${deletedConfigs.count} business configs`)

  // Step 8: Delete all localization data (if any exist)
  console.log('\n8. Cleaning up localization data...')
  const deletedTranslations = await prisma.translation.deleteMany({})
  const deletedLanguages = await prisma.language.deleteMany({})
  const deletedLocalizationKeys = await prisma.localizationKey.deleteMany({})
  try {
    const deletedGlossary = await (prisma as any).glossary?.deleteMany({}) || { count: 0 }
    console.log(`   ✅ Deleted ${deletedTranslations.count} translations, ${deletedLanguages.count} languages, ${deletedLocalizationKeys.count} localization keys, ${deletedGlossary.count} glossary entries`)
  } catch (e) {
    console.log(`   ✅ Deleted ${deletedTranslations.count} translations, ${deletedLanguages.count} languages, ${deletedLocalizationKeys.count} localization keys`)
  }

  // Step 9: Delete all experiments (if any exist)
  console.log('\n9. Cleaning up experiments...')
  try {
    const deletedExperiments = await (prisma as any).experiment?.deleteMany({}) || { count: 0 }
    console.log(`   ✅ Deleted ${deletedExperiments.count} experiments`)
  } catch (e) {
    console.log('   ⚠️  Experiment model not found, skipping...')
  }

  // Step 10: Delete all builds (if any exist)
  console.log('\n10. Cleaning up builds...')
  const deletedBuilds = await prisma.build.deleteMany({})
  console.log(`   ✅ Deleted ${deletedBuilds.count} builds`)

  // Step 11: Delete all system configurations (keep structure but clear test data)
  console.log('\n11. Cleaning up system configurations...')
  const deletedSystemConfigs = await prisma.systemConfiguration.deleteMany({})
  console.log(`   ✅ Deleted ${deletedSystemConfigs.count} system configurations`)

  // Final summary
  console.log('\n' + '='.repeat(50))
  console.log('✅ Database cleanup completed!')
  console.log('='.repeat(50))
  console.log('\nRemaining data:')
  
  const adminCount = await prisma.user.count({ where: { isAdmin: true } })
  const freePlanCount = await prisma.plan.count({ where: { name: 'free' } })
  const subscriptionCount = await prisma.subscription.count({})
  const projectCount = await prisma.project.count({})
  
  console.log(`- Admin users: ${adminCount}`)
  console.log(`- Free plan: ${freePlanCount}`)
  console.log(`- Subscriptions: ${subscriptionCount}`)
  console.log(`- Projects: ${projectCount}`)
  console.log('\n✨ Database is now clean and ready for fresh testing!')
}

main()
  .catch((e) => {
    console.error('❌ Error during cleanup:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

