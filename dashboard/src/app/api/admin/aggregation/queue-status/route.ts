import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { aggregationQueue } from '@/lib/aggregation/queue'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get queue statistics
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      aggregationQueue.getWaiting(),
      aggregationQueue.getActive(),
      aggregationQueue.getCompleted(),
      aggregationQueue.getFailed(),
      aggregationQueue.getDelayed(),
    ])

    // Get prioritized jobs (jobs with priority > 1)
    const prioritizedJobs = await aggregationQueue.getJobs(['waiting', 'active'], 0, 100)
    const prioritized = prioritizedJobs.filter(job => (job.opts?.priority || 1) > 1).length

    const queueStatus = {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      prioritized,
    }

    return NextResponse.json(queueStatus)
  } catch (error) {
    console.error('Get queue status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
