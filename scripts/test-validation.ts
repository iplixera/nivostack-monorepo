import { validateFeature } from './src/lib/subscription-validation'
import { checkThrottling } from './src/lib/throttling'
import { prisma } from './src/lib/prisma'

async function test() {
  try {
    const project = await prisma.project.findFirst({
      where: { apiKey: 'cmjoin79y00069z09upepkf11' }
    })
    
    if (!project) {
      console.error('Project not found')
      return
    }
    
    console.log('Testing validateFeature...')
    const validation = await validateFeature(project.userId, 'deviceTracking')
    console.log('Validation result:', validation)
    
    console.log('\nTesting checkThrottling...')
    const throttling = await checkThrottling(project.userId, 'devices')
    console.log('Throttling result:', throttling)
  } catch (e: any) {
    console.error('❌ Error:', e.message)
    console.error('Stack:', e.stack?.split('\n').slice(0, 10).join('\n'))
  } finally {
    await prisma.$disconnect()
  }
}

test()
