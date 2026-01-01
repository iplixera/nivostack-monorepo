# AWS SES Setup Guide for NivoStack Team Invitations

## Prerequisites

- Domain registered in GoDaddy: `nivostack.com` (or your domain)
- AWS account with SES access
- Access to GoDaddy DNS settings

---

## Step-by-Step Setup

### Step 1: Verify Domain in AWS SES

1. **Go to AWS SES Console**
   - Navigate to: https://console.aws.amazon.com/ses/
   - Select your region (e.g., `us-east-1`)

2. **Create Verified Identity**
   - Click "Verified identities" in left sidebar
   - Click "Create identity"
   - Choose "Domain"
   - Enter your domain: `nivostack.com` (or your domain)
   - Check "Enable DKIM signing" (recommended)
   - Click "Create identity"

3. **Get DNS Records**
   AWS will provide DNS records to add:
   - **CNAME records** (3 records for DKIM)
   - **TXT record** for domain verification
   - **TXT record** for SPF (if not already exists)

### Step 2: Add DNS Records in GoDaddy

1. **Log in to GoDaddy**
   - Go to: https://dcc.godaddy.com/
   - Select your domain
   - Click "DNS" or "Manage DNS"

2. **Add CNAME Records (DKIM)**
   - Click "Add" → Select "CNAME"
   - Add 3 CNAME records from AWS SES:
     ```
     Record 1:
     Name: [provided by AWS, e.g., abc123._domainkey]
     Value: [provided by AWS]
     TTL: 600
     
     Record 2:
     Name: [provided by AWS]
     Value: [provided by AWS]
     TTL: 600
     
     Record 3:
     Name: [provided by AWS]
     Value: [provided by AWS]
     TTL: 600
     ```

3. **Add TXT Record (Domain Verification)**
   - Click "Add" → Select "TXT"
   - Name: `@` (or leave blank for root domain)
   - Value: [provided by AWS]
   - TTL: 600

4. **Add TXT Record (SPF)**
   - If SPF record doesn't exist, add:
   - Name: `@`
   - Value: `v=spf1 include:amazonses.com ~all`
   - TTL: 600
   - **Note**: If SPF record already exists, add `include:amazonses.com` to it

5. **Save Changes**
   - Click "Save" or "Add Record"
   - DNS propagation can take 24-48 hours

### Step 3: Wait for Verification

1. **Check Status in AWS SES**
   - Go back to AWS SES → Verified identities
   - Status should change from "Pending verification" to "Verified"
   - This can take 24-48 hours

2. **Verify DKIM**
   - Once domain is verified, DKIM should also show as "Verified"
   - If not verified after 48 hours, check DNS records

### Step 4: Request Production Access

**Important**: AWS SES starts in "Sandbox" mode (can only send to verified emails).

1. **Go to Account Dashboard**
   - In AWS SES, click "Account dashboard" in left sidebar
   - You'll see "Sending statistics" and "Account status"

2. **Request Production Access**
   - Click "Request production access"
   - Fill out the form:
     - **Mail Type**: Transactional
     - **Website URL**: https://studio.nivostack.com
     - **Use case description**: 
       ```
       We need to send team invitation emails to users who are invited to collaborate on projects. 
       Users will receive invitations when team members add them to projects. 
       This is a transactional email service for our SaaS platform.
       ```
     - **Expected sending volume**: Estimate (e.g., 100-1000 emails/month initially)
     - **How do you plan to handle bounces/complaints**: 
       ```
       We will implement bounce and complaint handling. Users can unsubscribe from 
       non-essential emails via notification preferences. We will remove bounced 
       emails from our database.
       ```
   - Click "Submit"

3. **Wait for Approval**
   - AWS usually approves within 24 hours
   - You'll receive an email when approved
   - Check status in Account dashboard

### Step 5: Create SMTP Credentials

1. **Go to SMTP Settings**
   - In AWS SES, click "SMTP settings" in left sidebar
   - Click "Create SMTP credentials"

2. **Create IAM User**
   - Enter IAM user name: `ses-smtp-user` (or your choice)
   - Click "Create"
   - **Save credentials immediately** (you won't see the secret again):
     - **SMTP Username**: [save this]
     - **SMTP Password**: [save this]

3. **Note SMTP Server Details**
   - **SMTP Server**: `email-smtp.us-east-1.amazonaws.com` (or your region)
   - **Port**: `587` (TLS) or `465` (SSL)
   - **Region**: Your AWS region

### Step 6: Configure Environment Variables

Add to your `.env.local` (and Vercel environment variables):

```env
# AWS SES Configuration
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=your_smtp_username_here
AWS_SES_SECRET_ACCESS_KEY=your_smtp_password_here
AWS_SES_FROM_EMAIL=noreply@nivostack.com
AWS_SES_FROM_NAME=NivoStack

# Or use IAM credentials (alternative to SMTP)
# AWS_ACCESS_KEY_ID=your_iam_access_key
# AWS_SECRET_ACCESS_KEY=your_iam_secret_key
```

### Step 7: Install AWS SDK

```bash
cd dashboard
pnpm add @aws-sdk/client-ses
```

### Step 8: Create Email Service

Create `dashboard/src/lib/email/ses.ts`:

```typescript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

const sesClient = new SESClient({
  region: process.env.AWS_SES_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY!,
  },
})

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text?: string
}) {
  const command = new SendEmailCommand({
    Source: `${process.env.AWS_SES_FROM_NAME} <${process.env.AWS_SES_FROM_EMAIL}>`,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: html,
          Charset: 'UTF-8',
        },
        ...(text && {
          Text: {
            Data: text,
            Charset: 'UTF-8',
          },
        }),
      },
    },
  })

  const response = await sesClient.send(command)
  return response.MessageId
}
```

### Step 9: Set Up Email Tracking (Optional)

For tracking email opens/clicks:

1. **Create SNS Topic**
   - Go to AWS SNS → Topics
   - Create topic: `ses-email-events`
   - Note the ARN

2. **Configure SES Event Publishing**
   - Go to AWS SES → Configuration sets
   - Create configuration set: `email-tracking`
   - Add event destination:
     - Event types: `send`, `delivery`, `open`, `click`, `bounce`, `complaint`
     - Destination: SNS topic `ses-email-events`

3. **Create Webhook Endpoint**
   - Create `/api/webhooks/ses` endpoint
   - Subscribe to SNS topic
   - Update `ProjectInvitation` with tracking data

---

## Testing

### Test Email Sending

1. **Verify Email Address First** (Sandbox mode)
   - In AWS SES → Verified identities
   - Add your test email address
   - Verify it

2. **Send Test Email**
   ```typescript
   import { sendEmail } from '@/lib/email/ses'
   
   await sendEmail({
     to: 'your-verified-email@example.com',
     subject: 'Test Email',
     html: '<h1>Test</h1>',
   })
   ```

3. **Check Email**
   - Check inbox (and spam folder)
   - Verify sender shows as `noreply@nivostack.com`

---

## Troubleshooting

### Domain Not Verifying
- **Check DNS records**: Ensure all records are added correctly
- **Wait 24-48 hours**: DNS propagation takes time
- **Check TTL**: Lower TTL (600) helps with faster propagation
- **Verify in GoDaddy**: Check DNS records are saved correctly

### Emails Going to Spam
- **Verify SPF record**: Ensure `include:amazonses.com` is in SPF
- **Enable DKIM**: Should be enabled in SES
- **Warm up domain**: Start with low volume, gradually increase
- **Check sender reputation**: Use consistent "From" address

### Production Access Denied
- **Provide detailed use case**: Explain your business model
- **Show website**: Ensure website is live and professional
- **Estimate volume**: Be realistic about email volume
- **Wait and resubmit**: Sometimes takes multiple attempts

### SMTP Authentication Failed
- **Check credentials**: Ensure SMTP username/password are correct
- **Check region**: Ensure SMTP server matches your region
- **Check port**: Use 587 (TLS) or 465 (SSL)

---

## Cost Estimate

**AWS SES Pricing** (as of 2024):
- **First 62,000 emails/month**: Free (if sent from EC2)
- **After free tier**: $0.10 per 1,000 emails
- **Very cost-effective** for team invitation emails

**Example**:
- 1,000 invitations/month = $0.10
- 10,000 invitations/month = $1.00

---

## Security Best Practices

1. **Store credentials securely**: Use environment variables, never commit
2. **Use IAM roles**: Prefer IAM roles over access keys when possible
3. **Enable MFA**: Enable MFA on AWS account
4. **Monitor usage**: Set up CloudWatch alarms for unusual activity
5. **Handle bounces**: Remove bounced emails from database
6. **Respect unsubscribe**: Honor user notification preferences

---

## Next Steps

After SES is set up:
1. Update `ProjectInvitation` model with email tracking fields
2. Create email templates
3. Implement invitation email sending
4. Set up email event tracking (optional)
5. Test end-to-end flow

