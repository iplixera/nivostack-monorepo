/**
 * Website Constants
 * 
 * Site-wide constants, links, and configuration.
 */

import { DOMAINS, CONTACT, SOCIAL } from './branding';

// Navigation Links
export const NAV_LINKS = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

// Footer Links
export const FOOTER_LINKS = {
  product: [
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: `${DOMAINS.docs}`, label: 'Documentation', external: true },
    { href: '/integrations', label: 'Integrations' },
  ],
  company: [
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/blog', label: 'Blog' },
    { href: '/careers', label: 'Careers' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/security', label: 'Security' },
    { href: '/compliance', label: 'Compliance' },
  ],
  resources: [
    { href: `${DOMAINS.docs}`, label: 'Docs', external: true },
    { href: '/changelog', label: 'Changelog' },
    { href: '/status', label: 'Status' },
    { href: SOCIAL.github, label: 'GitHub', external: true },
  ],
} as const;

// Feature Categories
export const FEATURE_CATEGORIES = [
  {
    id: 'monitoring',
    name: 'Monitoring & Observability',
    icon: '📊',
    description: 'Real-time visibility into your app performance',
  },
  {
    id: 'debugging',
    name: 'Debugging & Troubleshooting',
    icon: '🔍',
    description: 'Debug issues faster with comprehensive tools',
  },
  {
    id: 'configuration',
    name: 'Remote Configuration',
    icon: '⚙️',
    description: 'Control your app without deployments',
  },
  {
    id: 'analytics',
    name: 'Analytics & Insights',
    icon: '📈',
    description: 'Understand user behavior and app performance',
  },
] as const;

// Supported Platforms
export const PLATFORMS = [
  { name: 'Flutter', icon: '📱', color: '#02569B' },
  { name: 'Android', icon: '🤖', color: '#3DDC84' },
  { name: 'iOS', icon: '🍎', color: '#000000' },
  { name: 'React Native', icon: '⚛️', color: '#61DAFB' },
  { name: 'Next.js', icon: '▲', color: '#000000' },
] as const;

// Pricing Plans (for reference)
export const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Free Forever',
    price: 0,
    description: 'Perfect for getting started',
    features: [
      '1 Project',
      '10,000 API Requests/month',
      '10,000 Logs/month',
      '1,000 Sessions/month',
      'Basic Analytics',
      'Community Support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    description: 'For growing teams',
    features: [
      '5 Projects',
      '100,000 API Requests/month',
      '100,000 Logs/month',
      '10,000 Sessions/month',
      'Advanced Analytics',
      'Email Support',
      'Feature Flags',
      'Remote Config',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    price: 149,
    description: 'For teams and agencies',
    features: [
      'Unlimited Projects',
      '1M API Requests/month',
      '1M Logs/month',
      '100,000 Sessions/month',
      'Premium Analytics',
      'Priority Support',
      'Team Collaboration',
      'Custom Integrations',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    description: 'Custom solutions for large organizations',
    features: [
      'Unlimited Everything',
      'Dedicated Support',
      'SLA Guarantee',
      'Custom Integrations',
      'On-premise Options',
      'Advanced Security',
    ],
  },
] as const;

