import { ExtractedContext, Question, ResearchResults } from "@/types";

export interface TechStackSelection {
  frontend: string
  backend: string
  database: string
  auth: string
  hosting: string
}

export const DEFAULT_STACKS: Record<string, TechStackSelection> = {
  web_app: {
    frontend: 'Next.js',
    backend: 'Node.js with Express',
    database: 'PostgreSQL',
    auth: 'Clerk',
    hosting: 'Vercel',
  },
  mobile_app: {
    frontend: 'React Native',
    backend: 'Firebase Functions',
    database: 'Firestore',
    auth: 'Firebase Auth',
    hosting: 'Expo + Firebase',
  },
  saas_platform: {
    frontend: 'Next.js',
    backend: 'Node.js with tRPC',
    database: 'PostgreSQL',
    auth: 'Clerk',
    hosting: 'Vercel + Railway',
  },
  ecommerce: {
    frontend: 'Next.js',
    backend: 'Stripe + Next.js API',
    database: 'PostgreSQL',
    auth: 'Clerk',
    hosting: 'Vercel',
  },
  dashboard: {
    frontend: 'React with Vite',
    backend: 'Node.js with Express',
    database: 'PostgreSQL',
    auth: 'Auth0',
    hosting: 'Netlify + Railway',
  },
  api_service: {
    frontend: 'N/A (API only)',
    backend: 'Node.js with Express',
    database: 'PostgreSQL',
    auth: 'JWT',
    hosting: 'Railway',
  },
  ai_app: {
    frontend: 'Next.js',
    backend: 'Python with FastAPI',
    database: 'PostgreSQL with pgvector',
    auth: 'Clerk',
    hosting: 'Vercel + Modal',
  },
  general: {
    frontend: 'Next.js',
    backend: 'Node.js with Express',
    database: 'PostgreSQL',
    auth: 'Clerk',
    hosting: 'Vercel',
  },
}

export function detectProductType(
  extractedContext: Partial<ExtractedContext> | null,
  answers: Question[] | null
): keyof typeof DEFAULT_STACKS {
  if (!extractedContext && !answers) return 'general'

  // Check for mobile keywords
  const mobileKeywords = ['mobile', 'ios', 'android', 'app store', 'react native']
  const description = extractedContext?.description?.toLowerCase() || ''
  const productName = extractedContext?.productName?.toLowerCase() || ''
  const features = extractedContext?.keyFeatures?.join(' ').toLowerCase() || ''
  const techPrefs = extractedContext?.technicalPreferences?.join(' ').toLowerCase() || ''

  const allText = `${description} ${productName} ${features} ${techPrefs}`

  if (mobileKeywords.some(kw => allText.includes(kw))) {
    return 'mobile_app'
  }

  // Check for e-commerce
  const ecommerceKeywords = ['shop', 'store', 'cart', 'payment', 'checkout', 'product catalog']
  if (ecommerceKeywords.some(kw => allText.includes(kw))) {
    return 'ecommerce'
  }

  // Check for AI
  const aiKeywords = ['ai', 'ml', 'machine learning', 'gpt', 'llm', 'chatbot', 'recommendation']
  if (aiKeywords.some(kw => allText.includes(kw))) {
    return 'ai_app'
  }

  // Check for dashboard/analytics
  const dashboardKeywords = ['dashboard', 'analytics', 'visualization', 'chart', 'metrics']
  if (dashboardKeywords.some(kw => allText.includes(kw))) {
    return 'dashboard'
  }

  // Check for API/backend service
  const apiKeywords = ['api', 'backend', 'service', 'microservice', 'webhook']
  if (apiKeywords.some(kw => allText.includes(kw))) {
    return 'api_service'
  }

  // Check for SaaS
  const saasKeywords = ['saas', 'subscription', 'multi-tenant', 'platform']
  if (saasKeywords.some(kw => allText.includes(kw))) {
    return 'saas_platform'
  }

  // Default to general web app
  return 'web_app'
}

export function getDefaultTechStack(
  extractedContext: Partial<ExtractedContext> | null,
  answers: Question[] | null
): TechStackSelection {
  const productType = detectProductType(extractedContext, answers)
  return DEFAULT_STACKS[productType] as TechStackSelection
}

export function generateMockResearchResults(
  stack: TechStackSelection
): ResearchResults {
  return {
    frontend: [
      {
        name: stack.frontend,
        description: `${stack.frontend} is a modern, production-ready framework.`,
        pros: ['Fast development', 'Great DX', 'Large community'],
        cons: ['Learning curve'],
        popularity: 'High',
      },
    ],
    backend: [
      {
        name: stack.backend,
        description: `${stack.backend} provides a robust backend solution.`,
        pros: ['Scalable', 'Well-documented', 'Ecosystem'],
        cons: ['Setup complexity'],
        popularity: 'High',
      },
    ],
    database: [
      {
        name: stack.database,
        description: `${stack.database} is a reliable database choice.`,
        pros: ['ACID compliant', 'Mature', 'Performant'],
        cons: ['Requires management'],
        popularity: 'High',
      },
    ],
    authentication: [
      {
        name: stack.auth,
        description: `${stack.auth} simplifies authentication.`,
        pros: ['Easy integration', 'Secure', 'Feature-rich'],
        cons: ['Third-party dependency'],
        popularity: 'High',
      },
    ],
    hosting: [
      {
        name: stack.hosting,
        description: `${stack.hosting} offers excellent deployment experience.`,
        pros: ['Zero-config', 'Auto-scaling', 'CDN'],
        cons: ['Pricing at scale'],
        popularity: 'High',
      },
    ],
  }
}
