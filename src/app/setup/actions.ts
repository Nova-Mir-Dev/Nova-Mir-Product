'use server'

import { writeFile } from 'fs/promises'
import { join } from 'path'
import { revalidatePath } from 'next/cache'

export async function saveEnvVars(
  envVars: Record<string, string>,
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    const entries = Object.entries(envVars).filter(
      ([, value]) => value.trim().length > 0,
    )
    if (entries.length === 0) return { success: true, path: '.env.local' }

    const content =
      entries.map(([k, v]) => `${k}=${v.trim()}`).join('\n') + '\n'
    await writeFile(join(process.cwd(), '.env.local'), content)

    const deployContent =
      entries
        .map(
          ([k, v]) =>
            `${k}=${k.startsWith('NEXT_PUBLIC_') ? v.trim() : '<set-in-vercel-dashboard>'}`,
        )
        .join('\n') + '\n'
    await writeFile(join(process.cwd(), '.env.production'), deployContent)

    revalidatePath('/setup')
    return { success: true, path: '.env.local' }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

export async function generateSlackManifest(config: {
  appName: string
  redirectUrl: string
}): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    const baseUrl = config.redirectUrl.replace(/\/$/, '')
    const manifest = {
      display_information: {
        name: config.appName || 'Nova Mir Admin',
        description: 'Admin portal notifications and interactions',
        background_color: '#0f172a',
      },
      features: {
        bot_user: {
          display_name: config.appName || 'Nova Mir Admin',
          always_online: false,
        },
      },
      oauth_config: {
        redirect_urls: [`${baseUrl}/api/slack/oauth_redirect`],
        scopes: {
          bot: [
            'chat:write',
            'channels:history',
            'groups:history',
            'users:read',
          ],
        },
      },
      settings: {
        event_subscriptions: {
          request_url: `${baseUrl}/api/slack/events`,
          bot_events: ['message.channels', 'message.im'],
        },
        org_deploy_enabled: false,
        socket_mode_enabled: false,
        token_rotation_enabled: false,
      },
    }

    const manifestPath = join(process.cwd(), 'public', 'slack-manifest.json')
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2))

    revalidatePath('/setup')
    return { success: true, path: '/slack-manifest.json' }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}
