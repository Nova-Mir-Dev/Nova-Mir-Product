import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'

type ServiceField = { key: string; label: string; docLink?: string }

type Service = {
  name: string
  url: string
  description: string
  fields: ServiceField[]
}

export function buildServices(config: BootConfig): Service[] {
  const services: Service[] = []

  if (config.databaseProvider === 'supabase') {
    services.push({
      name: 'Supabase',
      url: 'https://supabase.com/dashboard',
      description:
        'Database, auth, and file storage backend. Create a project and copy your API keys.',
      fields: [
        {
          key: 'NEXT_PUBLIC_SUPABASE_URL',
          label: 'Project URL',
          docLink: 'https://supabase.com/dashboard/project/_/settings/api',
        },
        {
          key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
          label: 'Anon Public Key',
        },
      ],
    })
  }

  if (config.auth === 'supabase-auth') {
    services.push({
      name: 'Supabase Auth',
      url: 'https://supabase.com/dashboard/project/_/auth/settings',
      description: 'Configure auth providers, site URL, and redirect URLs.',
      fields: [
        {
          key: 'SUPABASE_SERVICE_ROLE_KEY',
          label: 'Service Role Key (Server-only)',
          docLink: 'https://supabase.com/dashboard/project/_/settings/api',
        },
      ],
    })
  }

  if (config.payments === 'stripe') {
    services.push({
      name: 'Stripe',
      url: 'https://dashboard.stripe.com',
      description:
        'Payment processing. Create an account, get your API keys, and configure webhooks.',
      fields: [
        {
          key: 'STRIPE_SECRET_KEY',
          label: 'Secret Key',
          docLink: 'https://dashboard.stripe.com/apikeys',
        },
        {
          key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
          label: 'Publishable Key',
        },
        {
          key: 'STRIPE_WEBHOOK_SECRET',
          label: 'Webhook Signing Secret',
          docLink: 'https://dashboard.stripe.com/webhooks',
        },
      ],
    })
  }

  if (config.emailProvider === 'resend') {
    services.push({
      name: 'Resend',
      url: 'https://resend.com/domains',
      description:
        'Transactional email delivery. Create an account, verify your domain, and get your API key.',
      fields: [
        {
          key: 'RESEND_API_KEY',
          label: 'API Key',
          docLink: 'https://resend.com/api-keys',
        },
        {
          key: 'EMAIL_FROM',
          label: 'From Address',
        },
      ],
    })
  }

  if (config.monitoring === 'sentry') {
    services.push({
      name: 'Sentry',
      url: 'https://sentry.io/settings/account/api/',
      description:
        'Error tracking and performance monitoring. Create a project and get your DSN.',
      fields: [
        {
          key: 'NEXT_PUBLIC_SENTRY_DSN',
          label: 'DSN',
          docLink: 'https://docs.sentry.io/platforms/javascript/guides/nextjs/',
        },
        {
          key: 'SENTRY_AUTH_TOKEN',
          label: 'Auth Token',
        },
        {
          key: 'SENTRY_ORG',
          label: 'Organization Slug',
        },
        {
          key: 'SENTRY_PROJECT',
          label: 'Project Slug',
        },
      ],
    })
  }

  if (config.communicationPlatforms.includes('slack')) {
    services.push({
      name: 'Slack',
      url: 'https://api.slack.com/apps',
      description:
        'Messaging and notifications. Create a Slack app, install it to your workspace, and get your tokens.',
      fields: [
        {
          key: 'SLACK_BOT_TOKEN',
          label: 'Bot Token',
          docLink: 'https://api.slack.com/apps',
        },
        {
          key: 'SLACK_SIGNING_SECRET',
          label: 'Signing Secret',
        },
      ],
    })
  }

  if (config.logManagement === 'axiom') {
    services.push({
      name: 'Axiom',
      url: 'https://app.axiom.co/settings',
      description:
        'Log management and observability. Create a dataset and get your API token.',
      fields: [
        {
          key: 'NEXT_PUBLIC_AXIOM_DATASET',
          label: 'Dataset Name',
          docLink: 'https://app.axiom.co/datasets',
        },
        {
          key: 'AXIOM_API_TOKEN',
          label: 'API Token',
        },
      ],
    })
  }

  if (config.smsProvider === 'twilio') {
    services.push({
      name: 'Twilio',
      url: 'https://console.twilio.com',
      description:
        'SMS messaging. Create an account, get a phone number, and find your credentials.',
      fields: [
        {
          key: 'TWILIO_ACCOUNT_SID',
          label: 'Account SID',
          docLink: 'https://console.twilio.com',
        },
        {
          key: 'TWILIO_AUTH_TOKEN',
          label: 'Auth Token',
        },
        {
          key: 'TWILIO_PHONE_NUMBER',
          label: 'Phone Number',
        },
      ],
    })
  }

  if (config.hosting === 'vercel') {
    services.push({
      name: 'Vercel',
      url: 'https://vercel.com/dashboard',
      description:
        'Deployment platform. Connect your GitHub repository and deploy. Environment variables should be configured in the Vercel dashboard.',
      fields: [],
    })
  }

  return services
}

export function generateSetupWizard(config: BootConfig): GeneratedFile[] {
  const services = buildServices(config)
  const projectName = JSON.stringify(config.projectName)

  const servicesCards = services
    .map(
      (svc) => `
        <Card key={${JSON.stringify(svc.name)}}>
          <Stack spacing="sm">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Text element={{ as: "h3", size: "h4" }} weight="semibold">${JSON.stringify(svc.name)}</Text>
              <Button variant="secondary" size="sm" onClick={() => window.open(${JSON.stringify(svc.url)}, "_blank")}>
                Open ↗
              </Button>
            </div>
            <Text element={{ size: "sm" }} color="secondary">${JSON.stringify(svc.description)}</Text>
            ${svc.fields
              .map(
                (f) => `
            <div key={${JSON.stringify(f.key)}}>
              <Input
                label={{ text: ${JSON.stringify(f.label)} }}
                value={{ value: envVars[${JSON.stringify(f.key)}] || "", onChange: (e) => setEnvVars((prev) => ({ ...prev, [${JSON.stringify(f.key)}]: e.target.value })) }}
              />
            </div>`,
              )
              .join('')}
          </Stack>
        </Card>`,
    )
    .join('')

  return [
    {
      path: 'src/app/setup/page.tsx',
      content: `"use client";
import { useState, useEffect } from "react";
import { Container, Text, Button, Card, Stack, Alert, Input, ProgressBar, Tag } from "azimuth-ui";

type ServiceConfig = {
  name: string;
  url: string;
  description: string;
  fields: Array<{ key: string; label: string; docLink?: string }>;
};

const REQUIRED_SERVICES: ServiceConfig[] = ${JSON.stringify(services, null, 2)};
const STORAGE_KEY = "setup-complete";

export default function SetupPage() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [setupDone, setSetupDone] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "true") setSetupDone(true);
  }, []);

  if (setupDone) {
    return (
      <Container style={{ maxWidth: 480, margin: "4rem auto", padding: "0 1rem" }}>
        <Stack spacing="lg" align="center">
          <Text element={{ as: "h1", size: "h1" }} weight="bold">Setup Complete</Text>
          <Text color="secondary">Your project is configured and ready.</Text>
          <Stack spacing="sm" style={{ width: "100%" }}>
            <Button variant="primary" onClick={() => window.location.href = "/"}>
              Go to Dashboard
            </Button>
          </Stack>
          <div style={{ padding: "1rem", borderRadius: "var(--azimuth-radius)", background: "var(--azimuth-color-surface)", width: "100%" }}>
            <Text element={{ size: "sm" }} weight="semibold" style={{ marginBottom: 8, display: "block" }}>Optional: Clean up setup files</Text>
            <Text element={{ size: "xs" }} color="secondary">
              Run{" "}
              <code style={{ background: "var(--azimuth-color-muted-bg)", padding: "0.125rem 0.375rem", borderRadius: 4 }}>
                npm run cleanup
              </code>
              {" "}in your terminal to remove all setup scripts and leave a clean repo.
            </Text>
          </div>
        </Stack>
      </Container>
    );
  }

  function checkComplete() {
    const allFilled = REQUIRED_SERVICES.every((svc) =>
      svc.fields.every((f) => (envVars[f.key] || "").trim().length > 0),
    );
    return allFilled;
  }

  function completeSetup() {
    localStorage.setItem(STORAGE_KEY, "true");
    window.location.href = "/";
  }

  const completed = checkComplete();
  const totalFields = REQUIRED_SERVICES.reduce((c, s) => c + s.fields.length, 0);
  const filledFields = REQUIRED_SERVICES.reduce(
    (c, s) => c + s.fields.filter((f) => (envVars[f.key] || "").trim().length > 0).length,
    0,
  );

  return (
    <Container style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
      <Stack spacing="lg">
        <Text element={{ as: "h1", size: "h1" }} weight="bold">${projectName} — Setup</Text>
        <Text color="secondary">Complete the steps below to get your application running. Each service links to where you need to create an account and get your API keys.</Text>

        <div style={{ padding: "1rem", borderRadius: "var(--azimuth-radius)", background: "var(--azimuth-color-surface)" }}>
          <ProgressBar value={totalFields > 0 ? (filledFields / totalFields) * 100 : 0} />
          <Text element={{ size: "xs" }} color="muted" style={{ marginTop: 4 }}>{filledFields} of {totalFields} values filled</Text>
        </div>

        ${servicesCards}

        {completed ? (
          <Button variant="primary" onClick={completeSetup}>
            Complete Setup → Dashboard
          </Button>
        ) : (
          <Text element={{ size: "sm" }} color="muted">
            Fill in all environment variable fields above to continue.
          </Text>
        )}
      </Stack>
    </Container>
  );
}
`,
    },
  ]
}
