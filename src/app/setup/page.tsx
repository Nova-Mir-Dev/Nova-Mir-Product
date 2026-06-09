"use client";
import { useState, useEffect } from "react";
import { Container, Text, Button, Card, Stack, Alert, Input, ProgressBar, Tag } from "azimuth-ui";

type ServiceConfig = {
  name: string;
  url: string;
  description: string;
  fields: Array<{ key: string; label: string; docLink?: string }>;
};

const REQUIRED_SERVICES: ServiceConfig[] = [
  {
    "name": "Supabase",
    "url": "https://supabase.com/dashboard",
    "description": "Database, auth, and file storage backend. Create a project and copy your API keys.",
    "fields": [
      {
        "key": "NEXT_PUBLIC_SUPABASE_URL",
        "label": "Project URL",
        "docLink": "https://supabase.com/dashboard/project/_/settings/api"
      },
      {
        "key": "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "label": "Anon Public Key"
      }
    ]
  },
  {
    "name": "Sentry",
    "url": "https://sentry.io/settings/account/api/",
    "description": "Error tracking and performance monitoring. Create a project and get your DSN.",
    "fields": [
      {
        "key": "NEXT_PUBLIC_SENTRY_DSN",
        "label": "DSN",
        "docLink": "https://docs.sentry.io/platforms/javascript/guides/nextjs/"
      },
      {
        "key": "SENTRY_AUTH_TOKEN",
        "label": "Auth Token"
      },
      {
        "key": "SENTRY_ORG",
        "label": "Organization Slug"
      },
      {
        "key": "SENTRY_PROJECT",
        "label": "Project Slug"
      }
    ]
  },
  {
    "name": "Slack",
    "url": "https://api.slack.com/apps",
    "description": "Messaging and notifications. Create a Slack app, install it to your workspace, and get your tokens.",
    "fields": [
      {
        "key": "SLACK_BOT_TOKEN",
        "label": "Bot Token",
        "docLink": "https://api.slack.com/apps"
      },
      {
        "key": "SLACK_SIGNING_SECRET",
        "label": "Signing Secret"
      }
    ]
  },
  {
    "name": "Vercel",
    "url": "https://vercel.com/dashboard",
    "description": "Deployment platform. Connect your GitHub repository and deploy. Environment variables should be configured in the Vercel dashboard.",
    "fields": []
  }
];
const STORAGE_KEY = "setup-complete";

export default function SetupPage() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [setupDone, setSetupDone] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "true") setSetupDone(true);
  }, []);

  if (setupDone) {
    window.location.href = "/";
    return null;
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
        <Text element={{ as: "h1", size: "h1" }} weight="bold">"nova-mir-product" — Setup</Text>
        <Text color="secondary">Complete the steps below to get your application running. Each service links to where you need to create an account and get your API keys.</Text>

        <div style={{ padding: "1rem", borderRadius: "var(--azimuth-radius)", background: "var(--azimuth-color-surface)" }}>
          <ProgressBar value={totalFields > 0 ? (filledFields / totalFields) * 100 : 0} />
          <Text element={{ size: "xs" }} color="muted" style={{ marginTop: 4 }}>{filledFields} of {totalFields} values filled</Text>
        </div>

        
        <Card key={"Supabase"}>
          <Stack spacing="sm">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Text element={{ as: "h3", size: "h4" }} weight="semibold">"Supabase"</Text>
              <Button variant="secondary" size="sm" onClick={() => window.open("https://supabase.com/dashboard", "_blank")}>
                Open ↗
              </Button>
            </div>
            <Text element={{ size: "sm" }} color="secondary">"Database, auth, and file storage backend. Create a project and copy your API keys."</Text>
            
            <div key={"NEXT_PUBLIC_SUPABASE_URL"}>
              <Input
                label={{ text: "Project URL" }}
                value={{ value: envVars["NEXT_PUBLIC_SUPABASE_URL"] || "", onChange: (e) => setEnvVars((prev) => ({ ...prev, ["NEXT_PUBLIC_SUPABASE_URL"]: e.target.value })) }}
              />
            </div>
            <div key={"NEXT_PUBLIC_SUPABASE_ANON_KEY"}>
              <Input
                label={{ text: "Anon Public Key" }}
                value={{ value: envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"] || "", onChange: (e) => setEnvVars((prev) => ({ ...prev, ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]: e.target.value })) }}
              />
            </div>
          </Stack>
        </Card>
        <Card key={"Sentry"}>
          <Stack spacing="sm">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Text element={{ as: "h3", size: "h4" }} weight="semibold">"Sentry"</Text>
              <Button variant="secondary" size="sm" onClick={() => window.open("https://sentry.io/settings/account/api/", "_blank")}>
                Open ↗
              </Button>
            </div>
            <Text element={{ size: "sm" }} color="secondary">"Error tracking and performance monitoring. Create a project and get your DSN."</Text>
            
            <div key={"NEXT_PUBLIC_SENTRY_DSN"}>
              <Input
                label={{ text: "DSN" }}
                value={{ value: envVars["NEXT_PUBLIC_SENTRY_DSN"] || "", onChange: (e) => setEnvVars((prev) => ({ ...prev, ["NEXT_PUBLIC_SENTRY_DSN"]: e.target.value })) }}
              />
            </div>
            <div key={"SENTRY_AUTH_TOKEN"}>
              <Input
                label={{ text: "Auth Token" }}
                value={{ value: envVars["SENTRY_AUTH_TOKEN"] || "", onChange: (e) => setEnvVars((prev) => ({ ...prev, ["SENTRY_AUTH_TOKEN"]: e.target.value })) }}
              />
            </div>
            <div key={"SENTRY_ORG"}>
              <Input
                label={{ text: "Organization Slug" }}
                value={{ value: envVars["SENTRY_ORG"] || "", onChange: (e) => setEnvVars((prev) => ({ ...prev, ["SENTRY_ORG"]: e.target.value })) }}
              />
            </div>
            <div key={"SENTRY_PROJECT"}>
              <Input
                label={{ text: "Project Slug" }}
                value={{ value: envVars["SENTRY_PROJECT"] || "", onChange: (e) => setEnvVars((prev) => ({ ...prev, ["SENTRY_PROJECT"]: e.target.value })) }}
              />
            </div>
          </Stack>
        </Card>
        <Card key={"Slack"}>
          <Stack spacing="sm">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Text element={{ as: "h3", size: "h4" }} weight="semibold">"Slack"</Text>
              <Button variant="secondary" size="sm" onClick={() => window.open("https://api.slack.com/apps", "_blank")}>
                Open ↗
              </Button>
            </div>
            <Text element={{ size: "sm" }} color="secondary">"Messaging and notifications. Create a Slack app, install it to your workspace, and get your tokens."</Text>
            
            <div key={"SLACK_BOT_TOKEN"}>
              <Input
                label={{ text: "Bot Token" }}
                value={{ value: envVars["SLACK_BOT_TOKEN"] || "", onChange: (e) => setEnvVars((prev) => ({ ...prev, ["SLACK_BOT_TOKEN"]: e.target.value })) }}
              />
            </div>
            <div key={"SLACK_SIGNING_SECRET"}>
              <Input
                label={{ text: "Signing Secret" }}
                value={{ value: envVars["SLACK_SIGNING_SECRET"] || "", onChange: (e) => setEnvVars((prev) => ({ ...prev, ["SLACK_SIGNING_SECRET"]: e.target.value })) }}
              />
            </div>
          </Stack>
        </Card>
        <Card key={"Vercel"}>
          <Stack spacing="sm">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Text element={{ as: "h3", size: "h4" }} weight="semibold">"Vercel"</Text>
              <Button variant="secondary" size="sm" onClick={() => window.open("https://vercel.com/dashboard", "_blank")}>
                Open ↗
              </Button>
            </div>
            <Text element={{ size: "sm" }} color="secondary">"Deployment platform. Connect your GitHub repository and deploy. Environment variables should be configured in the Vercel dashboard."</Text>
            
          </Stack>
        </Card>

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
