import { prisma } from '../dashboard/src/lib/prisma'

async function enableTestSubscription() {
  try {
    // Find a project with a subscription
    const project = await prisma.project.findFirst({
      include: {
        user: {
          include: {
            subscription: true
          }
        }
      }
    })

    if (!project) {
      console.error('No project found')
      process.exit(1)
    }

    console.log(`Found project: ${project.name}`)
    console.log(`User: ${project.user.email}`)
    console.log(`Subscription status: ${project.user.subscription?.status}`)
    console.log(`Subscription enabled: ${project.user.subscription?.enabled}`)

    if (project.user.subscription) {
      // Enable the subscription
      await prisma.subscription.update({
        where: { userId: project.user.id },
        data: {
          enabled: true,
          status: 'active'
        }
      })
      console.log('\n✅ Subscription enabled and set to active')
    } else {
      console.log('\n❌ No subscription found for this user')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

enableTestSubscription()
