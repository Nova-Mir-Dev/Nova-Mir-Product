import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'

export function generateMonitoringFiles(config: BootConfig): GeneratedFile[] {
  const { monitoring } = config

  switch (monitoring) {
    case 'none':
      return []

    case 'sentry': {
      const clientConfig: GeneratedFile = {
        path: 'sentry.client.config.ts',
        content: `import * as Sentry from '@sentry/nextjs'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

Sentry.init({
  dsn: getEnv("NEXT_PUBLIC_SENTRY_DSN"),
  tracesSampleRate: 0.25,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
})
`,
      }

      const serverConfig: GeneratedFile = {
        path: 'sentry.server.config.ts',
        content: `import * as Sentry from '@sentry/nextjs'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

Sentry.init({
  dsn: getEnv("SENTRY_DSN"),
  tracesSampleRate: 0.25,
  environment: process.env.NODE_ENV,
})
`,
      }

      const edgeConfig: GeneratedFile = {
        path: 'sentry.edge.config.ts',
        content: `import * as Sentry from '@sentry/nextjs'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

Sentry.init({
  dsn: getEnv("SENTRY_DSN"),
  tracesSampleRate: 0.25,
})
`,
      }

      const instrumentation: GeneratedFile = {
        path: 'instrumentation.ts',
        content: `export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
`,
      }

      return [clientConfig, serverConfig, edgeConfig, instrumentation]
    }

    case 'datadog': {
      const datadogLib: GeneratedFile = {
        path: 'lib/datadog.ts',
        content: `import { StatsD } from 'hot-shots'

export const statsd = new StatsD({
  host: process.env.DD_AGENT_HOST || 'localhost',
  port: 8125,
  prefix: 'app.',
})

export function trackRequest(path: string, durationMs: number, status: number) {
  statsd.increment('requests.total', { path, status: String(status) })
  statsd.timing('requests.duration', durationMs, { path })
}

export function trackEvent(name: string, tags?: Record<string, string>) {
  statsd.increment(\`events.\${name}\`, tags)
}
`,
      }
      return [datadogLib]
    }

    case 'grafana': {
      const grafanaLib: GeneratedFile = {
        path: 'lib/grafana.ts',
        content: `import { createLogger, format, transports } from 'winston'
import LokiTransport from 'winston-loki'

export const logger = createLogger({
  format: format.json(),
  transports: [
    new transports.Console(),
    new LokiTransport({
      host: process.env.LOKI_HOST || 'http://localhost:3100',
      labels: { app: process.env.APP_NAME || 'app' },
      json: true,
    }),
  ],
})

export function logInfo(message: string, meta?: Record<string, unknown>) {
  logger.info(message, meta)
}

export function logError(error: Error, meta?: Record<string, unknown>) {
  logger.error(error.message, { stack: error.stack, ...meta })
}
`,
      }

      const dockerCompose: GeneratedFile = {
        path: 'docker/monitoring.yml',
        content: `version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - '9090:9090'
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  loki:
    image: grafana/loki:latest
    ports:
      - '3100:3100'

  grafana:
    image: grafana/grafana:latest
    ports:
      - '3000:3000'
    environment:
      GF_SECURITY_ADMIN_PASSWORD: \${process.env.GRAFANA_ADMIN_PASSWORD || 'changeme'}
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  prometheus_data:
  grafana_data:
`,
      }

      return [grafanaLib, dockerCompose]
    }
  }
}

export function generateAxiomIntegration(config: BootConfig): GeneratedFile[] {
  if (config.logManagement !== 'axiom') return []
  return [
    {
      path: 'lib/axiom.ts',
      content: `import { Axiom } from "@axiomhq/axiom-node";

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

const axiom = new Axiom({
  token: getEnv("AXIOM_API_TOKEN"),
});

export const axiomLogger = {
  info: (message: string, fields?: Record<string, unknown>) => {
    axiom.ingest(process.env.NEXT_PUBLIC_AXIOM_DATASET || "default", [{ level: "info", message, ...fields }]);
  },
  warn: (message: string, fields?: Record<string, unknown>) => {
    axiom.ingest(process.env.NEXT_PUBLIC_AXIOM_DATASET || "default", [{ level: "warn", message, ...fields }]);
  },
  error: (message: string, fields?: Record<string, unknown>) => {
    axiom.ingest(process.env.NEXT_PUBLIC_AXIOM_DATASET || "default", [{ level: "error", message, ...fields }]);
  },
};
`,
    },
  ]
}

export function generateAuditLogging(config: BootConfig): GeneratedFile[] {
  if (!config.auditLogging) return []

  return [
    {
      path: 'lib/audit-log.ts',
      content: `import { createClient } from "@/lib/supabase-server";

type AuditEvent = {
  action: string;
  entity: string;
  entityId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
};

async function persistAudit(event: AuditEvent) {
  try {
    const supabase = await createClient();
    await supabase.from("audit_logs").insert({
      action: event.action,
      entity: event.entity,
      entity_id: event.entityId || null,
      user_id: event.userId || null,
      metadata: event.metadata || null,
    });
  } catch {
    // Fall back to console if DB insert fails
    console.log(JSON.stringify(event));
  }
}

export function audit(event: AuditEvent): void {
  if (process.env.NODE_ENV === "production") {
    persistAudit(event);
  } else {
    console.log(JSON.stringify(event));
  }
}

export function auditLogin(userId: string, success: boolean): void {
  audit({
    action: success ? "login.success" : "login.failure",
    entity: "session",
    userId,
  });
}

export function auditDataAccess(
  userId: string,
  entity: string,
  entityId?: string,
): void {
  audit({
    action: "data.read",
    entity,
    entityId,
    userId,
  });
}

export function auditDataMutation(
  userId: string,
  action: "create" | "update" | "delete",
  entity: string,
  entityId?: string,
  metadata?: Record<string, unknown>,
): void {
  audit({
    action: \`data.\${action}\`,
    entity,
    entityId,
    userId,
    metadata,
  });
}

export function auditAdminAction(
  userId: string,
  action: string,
  metadata?: Record<string, unknown>,
): void {
  audit({
    action: \`admin.\${action}\`,
    entity: "admin",
    userId,
    metadata,
  });
}
`,
    },
  ]
}
