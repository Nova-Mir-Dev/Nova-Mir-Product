// Event queue utilities
// Configure with your queue provider (Inngest, QStash, BullMQ, etc.)

type EventHandler = (payload: unknown) => Promise<void>;
const handlers = new Map<string, EventHandler>();

export function registerEventHandler(event: string, handler: EventHandler): void {
  handlers.set(event, handler);
}

export async function publishEvent(event: string, payload: unknown): Promise<void> {
  const handler = handlers.get(event);
  if (!handler) {
    console.warn(`No handler registered for event: ${event}`);
    return;
  }
  // In production, send to actual queue system (Inngest, SQS, etc.)
  await handler(payload);
}

export async function processBatch(events: Array<{ type: string; payload: unknown }>): Promise<void> {
  await Promise.all(events.map((e) => publishEvent(e.type, e.payload)));
}
