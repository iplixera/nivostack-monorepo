import { prisma } from '../dashboard/src/lib/prisma'

async function checkPlanFeatures() {
  const project = await prisma.project.findFirst({
    include: {
      user: {
        include: {
          subscription: {
            include: {
              plan: true
            }
          }
        }
      }
    }
  })

  if (!project) {
    console.error('No project found')
    process.exit(1)
  }

  console.log('Plan:', project.user.subscription?.plan.name)
  console.log('Plan features:', JSON.stringify(project.user.subscription?.plan, null, 2))
  
  await prisma.$disconnect()
}

checkPlanFeatures()
