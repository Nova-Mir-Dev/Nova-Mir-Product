import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'

export function generateSmsConfig(config: BootConfig): GeneratedFile[] {
  if (config.smsProvider === 'none') return []
  return [
    {
      path: 'lib/sms.ts',
      content:
        config.smsProvider === 'twilio' ? smsTwilioContent : smsVonageContent,
    },
  ]
}

const smsTwilioContent = `import Twilio from "twilio";

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

const client = Twilio(
  getEnv('TWILIO_ACCOUNT_SID'),
  getEnv('TWILIO_AUTH_TOKEN'),
);

export async function sendSms(to: string, body: string) {
  const message = await client.messages.create({
    body,
    to,
    from: getEnv('TWILIO_PHONE_NUMBER'),
  });
  return message.sid;
}
`

const smsVonageContent = `import Vonage from "@vonage/server-sdk";

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

const vonage = new Vonage({
  apiKey: getEnv('VONAGE_API_KEY'),
  apiSecret: getEnv('VONAGE_API_SECRET'),
});

export async function sendSms(to: string, body: string) {
  const response = await vonage.sms.send({
    to,
    from: getEnv('VONAGE_PHONE_NUMBER'),
    text: body,
  });
  return response;
}
`

export function generatePushNotifications(config: BootConfig): GeneratedFile[] {
  if (!config.pushNotifications) return []
  return [
    {
      path: 'lib/push-notifications.ts',
      content: `// Push notification configuration
// TODO: Configure with your push provider (Firebase Cloud Messaging, OneSignal, etc.)

interface PushNotification {
  title: string;
  body: string;
  data?: Record<string, string>;
  tokens: string[];
}

export async function sendPushNotifications(notification: PushNotification) {
  // TODO: Implement with your chosen push provider
  console.log("Push notification:", notification);
}

export async function subscribeToPush(userId: string, subscription: PushSubscription) {
  // TODO: Store push subscription for the user
  console.log("Push subscription for", userId, ":", subscription);
}
`,
    },
  ]
}

export function generateInAppNotifications(
  config: BootConfig,
): GeneratedFile[] {
  if (!config.inAppNotifications) return []
  return [
    {
      path: 'lib/in-app-notifications.ts',
      content: `export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  link?: string;
  createdAt: Date;
}

const notifications: Map<string, InAppNotification[]> = new Map();

export function createNotification(
  userId: string,
  title: string,
  body: string,
  type: InAppNotification["type"] = "info",
  link?: string,
): InAppNotification {
  const notif: InAppNotification = {
    id: crypto.randomUUID(),
    userId,
    title,
    body,
    type,
    read: false,
    link,
    createdAt: new Date(),
  };
  const userNotifs = notifications.get(userId) || [];
  userNotifs.push(notif);
  notifications.set(userId, userNotifs);
  return notif;
}

export function getNotifications(userId: string, unreadOnly = false): InAppNotification[] {
  const userNotifs = notifications.get(userId) || [];
  return unreadOnly ? userNotifs.filter((n) => !n.read) : [...userNotifs].reverse();
}

export function markAsRead(userId: string, notificationId: string): void {
  const userNotifs = notifications.get(userId) || [];
  const notif = userNotifs.find((n) => n.id === notificationId);
  if (notif) notif.read = true;
}

export function markAllAsRead(userId: string): void {
  const userNotifs = notifications.get(userId) || [];
  userNotifs.forEach((n) => (n.read = true));
}
`,
    },
    {
      path: 'src/app/api/notifications/route.ts',
      content: `import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { getNotifications, markAllAsRead, markAsRead } from "@/lib/in-app-notifications";

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(getNotifications(user.id));
}

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { notificationIds } = (await request.json()) as { notificationIds?: string[] };
  if (notificationIds && notificationIds.length > 0) {
    notificationIds.forEach((id) => markAsRead(user.id, id));
  } else {
    markAllAsRead(user.id);
  }
  return NextResponse.json({ success: true });
}
`,
    },
  ]
}

export function generateChatProvider(config: BootConfig): GeneratedFile[] {
  if (config.chatProvider === 'none') return []
  const chats: Record<string, string> = {
    crisp: 'Crisp',
    intercom: 'Intercom',
    livechat: 'LiveChat',
    tawkto: 'Tawk.to',
  }
  return [
    {
      path: 'lib/chat.ts',
      content: `// Chat provider: ${chats[config.chatProvider] || config.chatProvider}
// TODO: Install and configure your chat provider SDK

export function initChat() {
  if (typeof window === "undefined") return;
}

export function openChat() {
}

export function closeChat() {
}
`,
    },
  ]
}

export function generateCostAlerts(config: BootConfig): GeneratedFile[] {
  if (!config.costAlerts) return []
  return [
    {
      path: 'lib/cost-alerts.ts',
      content: `const MONTHLY_BUDGET = ${String(config.costAlertThreshold)};
const ALERT_CHANNELS = ${JSON.stringify(config.costAlertNotification)};

export async function checkSpending(currentSpending: number) {
  const percentage = (currentSpending / MONTHLY_BUDGET) * 100;
  if (percentage >= 100) {
    await alert(\`Monthly budget exceeded! Spending: $\${currentSpending} / $\${MONTHLY_BUDGET}\`);
  } else if (percentage >= 80) {
    await alert(\`Budget warning: \${percentage.toFixed(1)}% of monthly budget used ($\${currentSpending} / $\${MONTHLY_BUDGET})\`);
  }
}

async function alert(message: string) {
  console.log("[Cost Alert]", message);
  for (const channel of ALERT_CHANNELS) {
    switch (channel) {
      case "email":
        break;
      case "slack":
        break;
    }
  }
}
`,
    },
  ]
}
