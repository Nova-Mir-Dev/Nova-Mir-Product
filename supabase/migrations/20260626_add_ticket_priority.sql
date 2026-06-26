-- Add priority column to support_tickets if not present
ALTER TABLE support_tickets
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'medium'
  CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
