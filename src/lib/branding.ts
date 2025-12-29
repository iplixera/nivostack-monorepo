/**
 * NivoStack Branding Constants
 * 
 * Centralized configuration for brand names, domains, and API endpoints.
 * This is the single source of truth for all branding-related constants.
 */

// Brand Names
export const BRAND = {
  name: 'NivoStack',
  studio: 'NivoStack Studio',
  sdk: 'NivoStack Core SDK',
  modules: {
    observe: 'Observe',
    control: 'Control',
    engage: 'Engage',
  },
} as const;

// Domains and Hostnames
export const DOMAINS = {
  marketing: process.env.NEXT_PUBLIC_MARKETING_URL || 'https://nivostack.com',
  console: process.env.NEXT_PUBLIC_CONSOLE_URL || 'https://studio.nivostack.com',
  docs: process.env.NEXT_PUBLIC_DOCS_URL || 'https://docs.nivostack.com',
  api: process.env.NEXT_PUBLIC_API_URL || 'https://api.nivostack.com',
  ingest: process.env.NEXT_PUBLIC_INGEST_URL || 'https://ingest.nivostack.com',
} as const;

// API Paths
export const API_PATHS = {
  base: '/v1',
  ingest: {
    batch: '/v1/ingest/batch',
  },
} as const;

// SDK Package Names
export const SDK_PACKAGES = {
  ios: {
    core: 'NivoStackCore',
    observe: 'NivoStackObserve',
    control: 'NivoStackControl',
    engage: 'NivoStackEngage',
  },
  android: {
    core: 'com.nivostack:core',
    observe: 'com.nivostack:observe',
    control: 'com.nivostack:control',
    engage: 'com.nivostack:engage',
  },
  react: {
    core: '@nivostack/core',
    observe: '@nivostack/observe',
    control: '@nivostack/control',
    engage: '@nivostack/engage',
  },
} as const;

// Environment Variable Names (for reference)
export const ENV_VARS = {
  marketingUrl: 'NEXT_PUBLIC_MARKETING_URL',
  consoleUrl: 'NEXT_PUBLIC_CONSOLE_URL',
  docsUrl: 'NEXT_PUBLIC_DOCS_URL',
  apiUrl: 'NEXT_PUBLIC_API_URL',
  ingestUrl: 'NEXT_PUBLIC_INGEST_URL',
} as const;

// Full API URLs
export const API_URLS = {
  ingest: {
    batch: `${DOMAINS.ingest}${API_PATHS.ingest.batch}`,
  },
  control: {
    base: DOMAINS.api,
  },
} as const;

