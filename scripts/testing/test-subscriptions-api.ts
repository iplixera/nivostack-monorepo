import { getAllSubscriptions } from './src/lib/admin'

async function test() {
  try {
    console.log('Testing getAllSubscriptions...')
    const subscriptions = await getAllSubscriptions()
    console.log(`✅ Successfully fetched ${subscriptions.length} subscriptions`)
    if (subscriptions.length > 0) {
      console.log('First subscription:', JSON.stringify(subscriptions[0], null, 2).substring(0, 500))
    }
  } catch (e: any) {
    console.error('❌ Error:', e.message)
    console.error('Code:', e.code)
    console.error('Stack:', e.stack?.split('\n').slice(0, 10).join('\n'))
  }
}

test()
