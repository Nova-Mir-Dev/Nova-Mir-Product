import { App } from '@slack/bolt'

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false,
})

app.message('hello', async ({ message, say }) => {
  await say(`Hey there <@${(message as any).user}>!`)
})

export { app }
