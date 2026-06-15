import { describe, it, expect, vi, beforeEach } from 'vitest'
import { notifyNewLead } from '../slack'

const mockPostMessage = vi.fn()
const mockApp = {
  client: {
    chat: {
      postMessage: mockPostMessage,
    },
  },
}

vi.mock('@slack/bolt', () => ({
  App: vi.fn(function () {
    return mockApp
  }),
}))

const testLead = {
  name: 'John Doe',
  email: 'john@example.com',
  businessName: 'Acme Inc',
  message: 'Looking for web design services',
}

beforeEach(() => {
  vi.clearAllMocks()
  delete process.env.SLACK_BOT_TOKEN
  delete process.env.SLACK_SIGNING_SECRET
  delete process.env.SLACK_LEADS_CHANNEL
})

describe('notifyNewLead', () => {
  it('skips notification when SLACK_BOT_TOKEN is missing', async () => {
    process.env.SLACK_SIGNING_SECRET = 'signing-secret'
    await notifyNewLead(testLead)
    expect(mockPostMessage).not.toHaveBeenCalled()
  })

  it('skips notification when SLACK_SIGNING_SECRET is missing', async () => {
    process.env.SLACK_BOT_TOKEN = 'bot-token'
    await notifyNewLead(testLead)
    expect(mockPostMessage).not.toHaveBeenCalled()
  })

  it('sends a slack message with lead details when env vars are set', async () => {
    process.env.SLACK_BOT_TOKEN = 'bot-token'
    process.env.SLACK_SIGNING_SECRET = 'signing-secret'

    await notifyNewLead(testLead)

    expect(mockPostMessage).toHaveBeenCalledTimes(1)
    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: '#leads',
        text: expect.stringContaining('John Doe'),
      }),
    )
  })

  it('includes all lead fields in the slack message', async () => {
    process.env.SLACK_BOT_TOKEN = 'bot-token'
    process.env.SLACK_SIGNING_SECRET = 'signing-secret'

    const leadWithAllFields = {
      ...testLead,
      phone: '555-0000',
      serviceInterest: 'Web Design',
      budgetRange: '$5k-$10k',
    }

    await notifyNewLead(leadWithAllFields)

    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        blocks: expect.arrayContaining([
          expect.objectContaining({
            type: 'section',
            fields: expect.arrayContaining([
              expect.objectContaining({
                text: expect.stringContaining('555-0000'),
              }),
              expect.objectContaining({
                text: expect.stringContaining('Web Design'),
              }),
              expect.objectContaining({
                text: expect.stringContaining('$5k-$10k'),
              }),
            ]),
          }),
        ]),
      }),
    )
  })

  it('uses custom channel when SLACK_LEADS_CHANNEL is set', async () => {
    process.env.SLACK_BOT_TOKEN = 'bot-token'
    process.env.SLACK_SIGNING_SECRET = 'signing-secret'
    process.env.SLACK_LEADS_CHANNEL = '#custom-leads'

    await notifyNewLead(testLead)

    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: '#custom-leads',
      }),
    )
  })
})
