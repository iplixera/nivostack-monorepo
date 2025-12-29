import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, isAdminUser } from '@/lib/auth'

/**
 * POST /api/admin/configurations/test
 * Test a configuration (e.g., test email, test payment, test MT provider)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { category, key, testType, testData } = await request.json()

    if (!category || !key || !testType) {
      return NextResponse.json(
        { error: 'category, key, and testType are required' },
        { status: 400 }
      )
    }

    // Get configuration
    const config = await prisma.systemConfiguration.findUnique({
      where: {
        category_key: {
          category,
          key
        }
      }
    })

    if (!config) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 })
    }

    let testResult: any = { success: false, message: '' }

    switch (testType) {
      case 'email':
        // Test email configuration
        testResult = await testEmailConfiguration(config, testData)
        break

      case 'payment':
        // Test payment configuration (Stripe)
        testResult = await testPaymentConfiguration(config, testData)
        break

      case 'machine_translation':
        // Test MT provider configuration
        testResult = await testMTConfiguration(config, testData)
        break

      case 'sms':
        // Test SMS configuration
        testResult = await testSMSConfiguration(config, testData)
        break

      case 'webhook':
        // Test webhook configuration
        testResult = await testWebhookConfiguration(config, testData)
        break

      default:
        return NextResponse.json(
          { error: `Unknown test type: ${testType}` },
          { status: 400 }
        )
    }

    return NextResponse.json({ testResult })
  } catch (error) {
    console.error('Test configuration error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function testEmailConfiguration(config: any, testData: any): Promise<any> {
  // TODO: Implement email test
  // Use SMTP settings to send a test email
  return {
    success: false,
    message: 'Email testing not yet implemented'
  }
}

async function testPaymentConfiguration(config: any, testData: any): Promise<any> {
  try {
    // Test Stripe connection
    if (config.category === 'payment' && config.key === 'stripe_secret_key') {
      const stripe = require('stripe')(config.value)
      const account = await stripe.accounts.retrieve()
      return {
        success: true,
        message: `Connected to Stripe account: ${account.id}`,
        account: {
          id: account.id,
          email: account.email,
          country: account.country
        }
      }
    }
    return {
      success: false,
      message: 'Invalid payment configuration'
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Payment test failed'
    }
  }
}

async function testMTConfiguration(config: any, testData: any): Promise<any> {
  try {
    const { provider, sourceText, sourceLang, targetLang } = testData || {}

    if (!provider || !sourceText || !sourceLang || !targetLang) {
      return {
        success: false,
        message: 'Missing required test data: provider, sourceText, sourceLang, targetLang'
      }
    }

    // Import translation functions
    if (provider === 'google') {
      const { translateWithGoogle } = await import('@/lib/localization/translators/google')
      const result = await translateWithGoogle(
        sourceText,
        sourceLang,
        targetLang,
        config.value || ''
      )
      return {
        success: true,
        message: 'Translation successful',
        result: {
          original: sourceText,
          translated: result.text,
          confidence: result.confidence
        }
      }
    } else if (provider === 'deepl') {
      const { translateWithDeepL } = await import('@/lib/localization/translators/deepl')
      const result = await translateWithDeepL(
        sourceText,
        sourceLang,
        targetLang,
        config.value || ''
      )
      return {
        success: true,
        message: 'Translation successful',
        result: {
          original: sourceText,
          translated: result.text,
          confidence: result.confidence
        }
      }
    } else if (provider === 'azure') {
      const { translateWithAzure } = await import('@/lib/localization/translators/azure')
      const apiSecret = await prisma.systemConfiguration.findUnique({
        where: { category_key: { category: 'machine_translation', key: 'azure_region' } }
      })
      const result = await translateWithAzure(
        sourceText,
        sourceLang,
        targetLang,
        config.value || '',
        apiSecret?.value || 'global'
      )
      return {
        success: true,
        message: 'Translation successful',
        result: {
          original: sourceText,
          translated: result.text,
          confidence: result.confidence
        }
      }
    }

    return {
      success: false,
      message: `Unknown provider: ${provider}`
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'MT test failed'
    }
  }
}

async function testSMSConfiguration(config: any, testData: any): Promise<any> {
  // TODO: Implement SMS test
  return {
    success: false,
    message: 'SMS testing not yet implemented'
  }
}

async function testWebhookConfiguration(config: any, testData: any): Promise<any> {
  try {
    // Test webhook URL by sending a test request
    const webhookUrl = config.value
    if (!webhookUrl) {
      return {
        success: false,
        message: 'Webhook URL not configured'
      }
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-DevBridge-Event': 'test',
        'X-DevBridge-Timestamp': new Date().toISOString()
      },
      body: JSON.stringify({
        event: 'test',
        timestamp: new Date().toISOString(),
        message: 'This is a test webhook from DevBridge'
      })
    })

    return {
      success: response.ok,
      message: response.ok
        ? `Webhook responded with status ${response.status}`
        : `Webhook failed with status ${response.status}`,
      status: response.status,
      statusText: response.statusText
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Webhook test failed'
    }
  }
}

