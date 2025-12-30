/**
 * Deployment Strategy Engine
 * Handles gradual rollouts: canary, linear, exponential
 */

export interface DeploymentConfig {
  strategy: 'immediate' | 'canary' | 'linear' | 'exponential'
  // Canary config
  canaryPercentage?: number // Initial percentage (e.g., 10)
  canaryDuration?: number // Minutes to wait before full rollout
  // Linear config
  linearSteps?: number // Number of steps (e.g., 5 steps = 20% increments)
  linearInterval?: number // Minutes between steps
  // Exponential config
  exponentialBase?: number // Base percentage (e.g., 5)
  exponentialMultiplier?: number // Multiplier (e.g., 2)
  exponentialInterval?: number // Minutes between steps
  exponentialMax?: number // Maximum percentage per step (e.g., 20)
}

export interface DeploymentState {
  currentPercentage: number
  targetPercentage: number
  nextUpdateTime: Date | null
  completed: boolean
}

/**
 * Calculate next deployment step
 */
export function calculateNextDeploymentStep(
  config: DeploymentConfig,
  currentPercentage: number,
  startTime: Date
): DeploymentState {
  const now = new Date()
  const elapsedMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60)

  switch (config.strategy) {
    case 'immediate':
      return {
        currentPercentage: 100,
        targetPercentage: 100,
        nextUpdateTime: null,
        completed: true
      }

    case 'canary':
      const canaryPct = config.canaryPercentage || 10
      const canaryDuration = config.canaryDuration || 60 // Default 1 hour

      if (currentPercentage < canaryPct) {
        return {
          currentPercentage: canaryPct,
          targetPercentage: 100,
          nextUpdateTime: new Date(startTime.getTime() + canaryDuration * 60 * 1000),
          completed: false
        }
      } else if (elapsedMinutes >= canaryDuration && currentPercentage < 100) {
        return {
          currentPercentage: 100,
          targetPercentage: 100,
          nextUpdateTime: null,
          completed: true
        }
      }
      return {
        currentPercentage,
        targetPercentage: 100,
        nextUpdateTime: currentPercentage < 100 ? new Date(startTime.getTime() + canaryDuration * 60 * 1000) : null,
        completed: currentPercentage >= 100
      }

    case 'linear': {
      const steps = config.linearSteps || 5
      const interval = config.linearInterval || 30 // Default 30 minutes
      const stepSize = 100 / steps
      const currentStep = Math.floor(currentPercentage / stepSize)
      const nextStep = currentStep + 1

      if (nextStep >= steps) {
        return {
          currentPercentage: 100,
          targetPercentage: 100,
          nextUpdateTime: null,
          completed: true
        }
      }

      const nextPercentage = Math.min(100, nextStep * stepSize)
      const nextUpdateTime = new Date(startTime.getTime() + (nextStep * interval * 60 * 1000))

      return {
        currentPercentage: nextPercentage,
        targetPercentage: 100,
        nextUpdateTime,
        completed: false
      }
    }

    case 'exponential': {
      const base = config.exponentialBase || 5
      const multiplier = config.exponentialMultiplier || 2
      const expInterval = config.exponentialInterval || 15 // Default 15 minutes
      const maxStep = config.exponentialMax || 20

      // Calculate which step we're on
      let step = 0
      let cumulative = 0
      while (cumulative < currentPercentage && step < 20) {
        const stepSize = Math.min(maxStep, base * Math.pow(multiplier, step))
        cumulative += stepSize
        if (cumulative <= currentPercentage) {
          step++
        } else {
          break
        }
      }

      const nextStep = step + 1
      let nextCumulative = 0
      for (let i = 0; i < nextStep; i++) {
        const stepSize = Math.min(maxStep, base * Math.pow(multiplier, i))
        nextCumulative += stepSize
      }

      if (nextCumulative >= 100) {
        return {
          currentPercentage: 100,
          targetPercentage: 100,
          nextUpdateTime: null,
          completed: true
        }
      }

      const nextUpdateTime = new Date(startTime.getTime() + (nextStep * expInterval * 60 * 1000))

      return {
        currentPercentage: Math.min(100, nextCumulative),
        targetPercentage: 100,
        nextUpdateTime,
        completed: false
      }
    }

    default:
      return {
        currentPercentage: 100,
        targetPercentage: 100,
        nextUpdateTime: null,
        completed: true
      }
  }
}

/**
 * Check if deployment should be updated
 */
export function shouldUpdateDeployment(
  deploymentState: DeploymentState
): boolean {
  if (deploymentState.completed) {
    return false
  }

  if (!deploymentState.nextUpdateTime) {
    return false
  }

  return new Date() >= deploymentState.nextUpdateTime
}

