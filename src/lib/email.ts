// Email Service - Placeholder implementation
// TODO: Integrate with email provider (SendGrid, Resend, AWS SES, etc.)

type EmailTemplate = 
  | 'payment_failed'
  | 'payment_reminder'
  | 'payment_succeeded'
  | 'trial_expiring'
  | 'trial_expired'
  | 'quota_warning_80'
  | 'quota_warning_90'
  | 'quota_exceeded'
  | 'early_renewal_offer'
  | 'extension_offer'
  | 'upgrade_offer'

type EmailData = {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send email (placeholder - will be implemented with actual email provider)
 */
export async function sendEmail(
  to: string,
  template: EmailTemplate,
  data: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  // TODO: Replace with actual email provider integration
  // For now, just log the email that would be sent
  
  const emailData = generateEmailContent(template, data)
  
  console.log('📧 Email would be sent:', {
    to,
    subject: emailData.subject,
    template,
    data,
  })

  // Placeholder: Return success for now
  // In production, this will call the email provider API
  return { success: true }
}

/**
 * Generate email content based on template
 */
function generateEmailContent(template: EmailTemplate, data: Record<string, any>): EmailData {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  
  switch (template) {
    case 'payment_failed':
      return {
        to: data.email,
        subject: 'Payment Failed - Action Required',
        html: `
          <h2>Payment Failed</h2>
          <p>Your payment for DevBridge ${data.planName || 'subscription'} failed.</p>
          <p><strong>Amount:</strong> $${data.amount?.toFixed(2) || '0.00'}</p>
          <p><strong>Reason:</strong> ${data.error || 'Unknown error'}</p>
          <p>Please update your payment method to avoid service interruption.</p>
          <p><a href="${baseUrl}/payment-methods">Update Payment Method</a></p>
        `,
        text: `Payment Failed. Amount: $${data.amount?.toFixed(2) || '0.00'}. Reason: ${data.error || 'Unknown error'}. Please update your payment method at ${baseUrl}/payment-methods`,
      }

    case 'payment_reminder':
      return {
        to: data.email,
        subject: `Reminder: Payment Due in ${data.daysRemaining} Day${data.daysRemaining !== 1 ? 's' : ''}`,
        html: `
          <h2>Payment Reminder</h2>
          <p>Your payment is due in ${data.daysRemaining} day${data.daysRemaining !== 1 ? 's' : ''}.</p>
          <p><strong>Amount:</strong> $${data.amount?.toFixed(2) || '0.00'}</p>
          <p><strong>Due Date:</strong> ${data.dueDate ? new Date(data.dueDate).toLocaleDateString() : 'N/A'}</p>
          <p>Update your payment method to avoid service interruption.</p>
          <p><a href="${baseUrl}/payment-methods">Update Payment Method</a></p>
        `,
        text: `Payment reminder: Due in ${data.daysRemaining} day${data.daysRemaining !== 1 ? 's' : ''}. Amount: $${data.amount?.toFixed(2) || '0.00'}. Update at ${baseUrl}/payment-methods`,
      }

    case 'payment_succeeded':
      return {
        to: data.email,
        subject: 'Payment Successful',
        html: `
          <h2>Payment Successful</h2>
          <p>Your payment for DevBridge ${data.planName || 'subscription'} was successful.</p>
          <p><strong>Amount:</strong> $${data.amount?.toFixed(2) || '0.00'}</p>
          <p><strong>Invoice:</strong> ${data.invoiceNumber || 'N/A'}</p>
          <p>Thank you for your payment!</p>
        `,
        text: `Payment successful. Amount: $${data.amount?.toFixed(2) || '0.00'}. Invoice: ${data.invoiceNumber || 'N/A'}`,
      }

    case 'trial_expiring':
      return {
        to: data.email,
        subject: `Your Free Trial Ends in ${data.daysRemaining} Day${data.daysRemaining !== 1 ? 's' : ''}`,
        html: `
          <h2>Trial Ending Soon</h2>
          <p>Your free trial ends in ${data.daysRemaining} day${data.daysRemaining !== 1 ? 's' : ''}.</p>
          <p><strong>Trial End Date:</strong> ${data.trialEndDate ? new Date(data.trialEndDate).toLocaleDateString() : 'N/A'}</p>
          <p>Upgrade to Pro Plan to continue using DevBridge after your trial ends.</p>
          <p><a href="${baseUrl}/subscription">Upgrade Now</a></p>
        `,
        text: `Trial ending in ${data.daysRemaining} day${data.daysRemaining !== 1 ? 's' : ''}. Upgrade at ${baseUrl}/subscription`,
      }

    case 'trial_expired':
      return {
        to: data.email,
        subject: 'Your Free Trial Has Ended - Upgrade to Continue',
        html: `
          <h2>Trial Expired</h2>
          <p>Your free trial has ended. Your SDK is now disabled.</p>
          <p><strong>Good news:</strong> Your data is safe and will be available once you upgrade.</p>
          <p>Upgrade to Pro Plan to continue using DevBridge and regain access to all features.</p>
          <p><a href="${baseUrl}/subscription" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">Upgrade Now</a></p>
        `,
        text: `Trial expired. Your SDK is disabled but your data is safe. Upgrade at ${baseUrl}/subscription to continue using DevBridge.`,
      }

    case 'quota_warning_80':
      return {
        to: data.email,
        subject: `You've Used 80% of Your ${data.meterName || 'Quota'}`,
        html: `
          <h2>Quota Warning</h2>
          <p>You've used 80% of your ${data.meterName || 'quota'}.</p>
          <p><strong>Used:</strong> ${data.used || 0} / ${data.limit || 'Unlimited'}</p>
          <p>Consider upgrading to avoid service interruption.</p>
          <p><a href="${baseUrl}/subscription">Upgrade Plan</a></p>
        `,
        text: `80% quota used: ${data.used || 0} / ${data.limit || 'Unlimited'}. Upgrade at ${baseUrl}/subscription`,
      }

    case 'quota_warning_90':
      return {
        to: data.email,
        subject: `You've Used 90% of Your ${data.meterName || 'Quota'}`,
        html: `
          <h2>Quota Warning</h2>
          <p>You've used 90% of your ${data.meterName || 'quota'}.</p>
          <p><strong>Used:</strong> ${data.used || 0} / ${data.limit || 'Unlimited'}</p>
          <p><strong>Action Required:</strong> Upgrade soon to avoid service interruption.</p>
          <p><a href="${baseUrl}/subscription">Upgrade Plan</a></p>
        `,
        text: `90% quota used: ${data.used || 0} / ${data.limit || 'Unlimited'}. Upgrade at ${baseUrl}/subscription`,
      }

    case 'quota_exceeded':
      return {
        to: data.email,
        subject: `Quota Exceeded - Service Limited`,
        html: `
          <h2>Quota Exceeded</h2>
          <p>You've exceeded your ${data.meterName || 'quota'} limit.</p>
          <p><strong>Used:</strong> ${data.used || 0} / ${data.limit || 'Unlimited'}</p>
          <p><strong>Status:</strong> Service is currently limited. Upgrade to continue using all features.</p>
          <p><a href="${baseUrl}/subscription">Upgrade Plan</a></p>
        `,
        text: `Quota exceeded: ${data.used || 0} / ${data.limit || 'Unlimited'}. Upgrade at ${baseUrl}/subscription`,
      }

    default:
      return {
        to: data.email,
        subject: 'Notification from DevBridge',
        html: '<p>Notification from DevBridge</p>',
        text: 'Notification from DevBridge',
      }
  }
}

/**
 * Batch send emails (for future optimization)
 */
export async function sendBulkEmails(emails: Array<{ to: string; template: EmailTemplate; data: Record<string, any> }>): Promise<{
  sent: number
  failed: number
  errors: string[]
}> {
  const results = await Promise.allSettled(
    emails.map(email => sendEmail(email.to, email.template, email.data))
  )

  const sent = results.filter(r => r.status === 'fulfilled' && r.value.success).length
  const failed = results.length - sent
  const errors = results
    .filter((r, i) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success))
    .map((r, i) => {
      if (r.status === 'rejected') return `Email ${i}: ${r.reason}`
      return `Email ${i}: ${r.value.error || 'Unknown error'}`
    })

  return { sent, failed, errors }
}

