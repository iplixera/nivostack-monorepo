import Stripe from 'stripe'

// Initialize Stripe client
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ''
if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY not set - Stripe functionality will be disabled')
}

export const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
}) : null

/**
 * Create or retrieve Stripe customer for a user
 */
export async function getOrCreateCustomer(userId: string, email: string, name?: string): Promise<string | null> {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  // Check if user already has a Stripe customer ID stored
  // For now, we'll create a new customer each time (can be optimized later)
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      userId,
    },
  })

  return customer.id
}

/**
 * Create payment method from token
 */
export async function createPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod | null> {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  // Retrieve payment method (already created by Stripe.js on frontend)
  const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
  return paymentMethod
}

/**
 * Attach payment method to customer
 */
export async function attachPaymentMethod(
  paymentMethodId: string,
  customerId: string
): Promise<Stripe.PaymentMethod> {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  })

  return paymentMethod
}

/**
 * Charge a payment method
 */
export async function chargePaymentMethod(
  paymentMethodId: string,
  customerId: string,
  amount: number,
  currency: string = 'usd',
  description?: string
): Promise<{
  success: boolean
  paymentIntentId?: string
  error?: string
}> {
  if (!stripe) {
    return { success: false, error: 'Stripe is not configured' }
  }

  try {
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      payment_method: paymentMethodId,
      customer: customerId,
      confirm: true,
      description: description || 'DevBridge Subscription',
      return_url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/payment/success`,
    })

    if (paymentIntent.status === 'succeeded') {
      return {
        success: true,
        paymentIntentId: paymentIntent.id,
      }
    } else {
      return {
        success: false,
        error: `Payment intent status: ${paymentIntent.status}`,
      }
    }
  } catch (error: any) {
    console.error('Stripe charge error:', error)
    return {
      success: false,
      error: error.message || 'Payment failed',
    }
  }
}

/**
 * Create payment intent (for frontend confirmation)
 */
export async function createPaymentIntent(
  customerId: string,
  amount: number,
  currency: string = 'usd',
  paymentMethodId?: string
): Promise<Stripe.PaymentIntent | null> {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: currency.toLowerCase(),
    customer: customerId,
    payment_method: paymentMethodId,
    setup_future_usage: paymentMethodId ? 'off_session' : undefined,
    metadata: {
      description: 'DevBridge Subscription',
    },
  })

  return paymentIntent
}

/**
 * Retrieve payment method
 */
export async function retrievePaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod | null> {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  try {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
    return paymentMethod
  } catch (error) {
    console.error('Error retrieving payment method:', error)
    return null
  }
}

/**
 * List payment methods for a customer
 */
export async function listPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  })

  return paymentMethods.data
}

/**
 * Delete payment method
 */
export async function deletePaymentMethod(paymentMethodId: string): Promise<boolean> {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  try {
    await stripe.paymentMethods.detach(paymentMethodId)
    return true
  } catch (error) {
    console.error('Error deleting payment method:', error)
    return false
  }
}

/**
 * Update payment method
 */
export async function updatePaymentMethod(
  paymentMethodId: string,
  updates: {
    billing_details?: Stripe.PaymentMethodUpdateParams.BillingDetails
    metadata?: Record<string, string>
  }
): Promise<Stripe.PaymentMethod | null> {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  try {
    const paymentMethod = await stripe.paymentMethods.update(paymentMethodId, updates)
    return paymentMethod
  } catch (error) {
    console.error('Error updating payment method:', error)
    return null
  }
}

