import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'

export function generateAgentIntegration(config: BootConfig): GeneratedFile[] {
  if (config.agentIntegration === 'none') return []
  const content =
    config.agentIntegration === 'vercel-ai-sdk' ? aiSdkContent : openaiContent
  return [{ path: 'lib/agent.ts', content }]
}

const aiSdkContent = `import { generateText, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

const openai = createOpenAI({ apiKey: getEnv("OPENAI_API_KEY") });

export async function askAgent(prompt: string): Promise<string> {
  const { text } = await generateText({
    model: openai("gpt-4o"),
    prompt,
  });
  return text;
}

export async function streamAgent(prompt: string) {
  return streamText({
    model: openai("gpt-4o"),
    prompt,
  });
}
`

const openaiContent = `import OpenAI from "openai";

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

const openai = new OpenAI({ apiKey: getEnv("OPENAI_API_KEY") });

export async function askAgent(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
  });
  return response.choices[0]?.message?.content || "";
}

export async function* streamAgent(prompt: string) {
  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    stream: true,
  });
  for await (const chunk of stream) {
    yield chunk.choices[0]?.delta?.content || "";
  }
}
`

export function generateAgentUseCases(config: BootConfig): GeneratedFile[] {
  if (config.agentUseCases.length === 0) return []
  const files: GeneratedFile[] = []

  if (config.agentUseCases.includes('search')) {
    files.push({
      path: 'lib/agent-search.ts',
      content: `// AI-powered search with embeddings
import { askAgent } from "./agent";

export async function semanticSearch(query: string, documents: string[]): Promise<string> {
  return askAgent(\`Given these documents: \${JSON.stringify(documents)}, answer: \${query}\`);
}

export async function generateEmbedding(text: string): Promise<number[]> {
  // TODO: Generate embedding via OpenAI/Cohere API
  // Return vector for storage in pgvector or similar
  return [];
}
`,
    })
  }

  if (config.agentUseCases.includes('content')) {
    files.push({
      path: 'lib/agent-content.ts',
      content: `// AI content generation
import { askAgent } from "./agent";

export async function generateBlogPost(topic: string, tone = "professional"): Promise<string> {
  return askAgent(\`Write a blog post about \${topic} in a \${tone} tone.\`);
}

export async function generateMarketingCopy(product: string, audience: string): Promise<string> {
  return askAgent(\`Write marketing copy for \${product} targeting \${audience}.\`);
}
`,
    })
  }

  if (config.agentUseCases.includes('support')) {
    files.push({
      path: 'lib/agent-support.ts',
      content: `// AI customer support
import { askAgent } from "./agent";

const KNOWLEDGE_BASE = \`\\\`
// TODO: Add your knowledge base content here
\`;

export async function answerSupportQuestion(question: string): Promise<string> {
  return askAgent(\`You are a support agent. Using this knowledge: \${KNOWLEDGE_BASE}, answer: \${question}\`);
}

export async function classifyTicket(message: string): Promise<string> {
  return askAgent(\`Classify this support ticket into: billing, technical, account, feature-request, or other. Message: \${message}\`);
}
`,
    })
  }

  return files
}

export function generateHostingRegionDocs(config: BootConfig): GeneratedFile[] {
  return [
    {
      path: 'docs/REGION.md',
      content: `# Deployment Region: ${config.hostingRegion}

## Region Configuration
Your application is configured for the \`${config.hostingRegion}\` region.

## Latency Considerations
- Primary target users should be geographically near this region
- Consider multi-region deployment for global user base
- Use CDN edge caching to reduce latency for distant users

## Compliance
- Data stored in ${config.hostingRegion} is subject to regional data protection laws
- Verify this region meets your compliance requirements${config.targetMarkets.some((m) => ['eu', 'uk'].includes(m)) ? '\n- For EU/UK users: ensure data stays within EU/UK regions or use Standard Contractual Clauses' : ''}
`,
    },
  ]
}

export function generateFileAccessControl(
  _config: BootConfig,
): GeneratedFile[] {
  return [
    {
      path: 'lib/file-access.ts',
      content: `// File access control utilities

export type AccessLevel = "public" | "authenticated" | "owner" | "admin";

interface FileAccess {
  filePath: string;
  accessLevel: AccessLevel;
  allowedUserIds?: string[];
}

export function canAccessFile(
  file: FileAccess,
  userId: string | null,
  isAdmin: boolean,
): boolean {
  if (isAdmin) return true;
  if (file.accessLevel === "public") return true;
  if (file.accessLevel === "authenticated" && userId) return true;
  if (file.accessLevel === "owner" && file.allowedUserIds?.includes(userId || "")) return true;
  return false;
}

export function getAccessLevel(isPublic: boolean, isAuthenticated: boolean): AccessLevel {
  if (isPublic) return "public";
  if (isAuthenticated) return "authenticated";
  return "owner";
}
`,
    },
  ]
}

export function generateSecurityHeadersDoc(
  config: BootConfig,
): GeneratedFile[] {
  if (!config.securityHeaders) return []
  return [
    {
      path: 'docs/SECURITY_HEADERS.md',
      content: `# Security Headers Configuration

Your application has the following security headers configured:

## Active Headers
- [x] **Strict-Transport-Security**: max-age=31536000; includeSubDomains
- [x] **X-Frame-Options**: SAMEORIGIN
- [x] **X-Content-Type-Options**: nosniff
- [x] **Referrer-Policy**: strict-origin-when-cross-origin
${config.corsEnabled ? '- [x] **CORS**: Configured in lib/cors.ts' : ''}
- [x] **Content-Security-Policy**: Configured in next.config.ts

## Testing
- [ ] Test headers at [securityheaders.com](https://securityheaders.com)
- [ ] Verify CSP doesn't block legitimate resources in console
${config.monitoring === 'sentry' ? '- [ ] Add Sentry tunnel route to CSP if using tunnelRoute' : ''}
`,
    },
  ]
}
