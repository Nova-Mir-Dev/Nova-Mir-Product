import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'

export function generateDatabaseFiles(config: BootConfig): GeneratedFile[] {
  const {
    database,
    databaseProvider,
    auth,
    multiTenancy,
    auditLogging,
    apiKeyAuth,
    appointments,
    eSignature,
    payments,
  } = config

  const useRls = multiTenancy === 'shared' && auth !== 'none'

  switch (database) {
    case 'postgresql': {
      const schemaLines = [
        'CREATE TABLE IF NOT EXISTS users (',
        '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),',
        '  email VARCHAR(255) UNIQUE NOT NULL,',
        '  name VARCHAR(255),',
        '  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),',
        '  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
        ');',
      ]

      if (auditLogging) {
        schemaLines.push(
          '',
          '-- Audit logging',
          'CREATE TABLE IF NOT EXISTS audit_logs (',
          '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),',
          '  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),',
          '  action TEXT NOT NULL,',
          '  entity TEXT NOT NULL,',
          '  entity_id TEXT,',
          '  user_id UUID REFERENCES users(id),',
          '  metadata JSONB,',
          '  ip_address TEXT',
          ');',
          '',
          'CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);',
          'CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);',
          'CREATE INDEX idx_audit_logs_entity ON audit_logs(entity);',
        )
      }

      if (apiKeyAuth) {
        schemaLines.push(
          '',
          '-- API Keys',
          'CREATE TABLE IF NOT EXISTS api_keys (',
          '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),',
          '  user_id UUID NOT NULL REFERENCES users(id),',
          '  name TEXT NOT NULL,',
          '  prefix TEXT NOT NULL,',
          '  hash TEXT NOT NULL UNIQUE,',
          "  scopes TEXT[] DEFAULT '{}',",
          '  last_used_at TIMESTAMPTZ,',
          '  expires_at TIMESTAMPTZ,',
          '  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),',
          '  revoked_at TIMESTAMPTZ',
          ');',
        )
      }

      if (appointments) {
        schemaLines.push(
          '',
          '-- Appointments / Scheduling',
          'CREATE TABLE IF NOT EXISTS appointments (',
          '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),',
          '  user_id UUID NOT NULL REFERENCES users(id),',
          '  title TEXT NOT NULL,',
          '  description TEXT,',
          '  start_time TIMESTAMPTZ NOT NULL,',
          '  end_time TIMESTAMPTZ NOT NULL,',
          "  status TEXT NOT NULL DEFAULT 'scheduled',",
          '  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),',
          '  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()',
          ');',
          '',
          'CREATE INDEX idx_appointments_user ON appointments(user_id);',
          'CREATE INDEX idx_appointments_time ON appointments(start_time);',
        )
      }

      if (eSignature) {
        schemaLines.push(
          '',
          '-- eSignature / Documents',
          'CREATE TABLE IF NOT EXISTS documents (',
          '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),',
          '  user_id UUID NOT NULL REFERENCES users(id),',
          '  title TEXT NOT NULL,',
          '  file_path TEXT NOT NULL,',
          "  status TEXT NOT NULL DEFAULT 'pending',",
          '  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),',
          '  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()',
          ');',
          '',
          'CREATE TABLE IF NOT EXISTS signatures (',
          '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),',
          '  document_id UUID NOT NULL REFERENCES documents(id),',
          '  signer_id UUID NOT NULL REFERENCES users(id),',
          '  signed_at TIMESTAMPTZ,',
          '  ip_address TEXT,',
          '  created_at TIMESTAMPTZ NOT NULL DEFAULT now()',
          ');',
        )
      }

      if (auth !== 'none') {
        schemaLines.push(
          '',
          '-- Sessions',
          'CREATE TABLE IF NOT EXISTS sessions (',
          '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),',
          '  user_id UUID NOT NULL REFERENCES users(id),',
          '  ip_address TEXT,',
          '  user_agent TEXT,',
          '  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),',
          '  expires_at TIMESTAMPTZ NOT NULL',
          ');',
          'CREATE INDEX idx_sessions_user ON sessions(user_id);',
        )
      }

      if (payments !== 'none') {
        schemaLines.push(
          '',
          '-- Payments',
          'CREATE TABLE IF NOT EXISTS payments (',
          '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),',
          '  user_id UUID NOT NULL REFERENCES users(id),',
          '  amount INTEGER NOT NULL,',
          "  currency TEXT NOT NULL DEFAULT 'usd',",
          "  status TEXT NOT NULL DEFAULT 'pending',",
          '  provider TEXT NOT NULL,',
          '  provider_payment_id TEXT,',
          '  created_at TIMESTAMPTZ NOT NULL DEFAULT now()',
          ');',
          'CREATE INDEX idx_payments_user ON payments(user_id);',
        )
      }

      if (useRls) {
        schemaLines.push(
          '',
          '-- Row Level Security',
          'ALTER TABLE users ENABLE ROW LEVEL SECURITY;',
          '',
          'CREATE POLICY "Users can view own data" ON users',
          '  FOR SELECT',
          '  USING (auth.uid() = id);',
          '',
          'CREATE POLICY "Users can update own data" ON users',
          '  FOR UPDATE',
          '  USING (auth.uid() = id);',
        )

        if (auditLogging) {
          schemaLines.push(
            '',
            'ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;',
            'CREATE POLICY "Users can view own audit logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);',
            'CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);',
          )
        }

        if (apiKeyAuth) {
          schemaLines.push(
            '',
            'ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;',
            'CREATE POLICY "Users can view own API keys" ON api_keys FOR SELECT USING (auth.uid() = user_id);',
            'CREATE POLICY "Users can insert own API keys" ON api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);',
            'CREATE POLICY "Users can revoke own API keys" ON api_keys FOR UPDATE USING (auth.uid() = user_id);',
          )
        }

        if (appointments) {
          schemaLines.push(
            '',
            'ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;',
            'CREATE POLICY "Users can view own appointments" ON appointments FOR SELECT USING (auth.uid() = user_id);',
            'CREATE POLICY "Users can manage own appointments" ON appointments FOR INSERT WITH CHECK (auth.uid() = user_id);',
            'CREATE POLICY "Users can update own appointments" ON appointments FOR UPDATE USING (auth.uid() = user_id);',
          )
        }

        if (eSignature) {
          schemaLines.push(
            '',
            'ALTER TABLE documents ENABLE ROW LEVEL SECURITY;',
            'CREATE POLICY "Users can view own documents" ON documents FOR SELECT USING (auth.uid() = user_id);',
            'CREATE POLICY "Users can upload documents" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);',
            '',
            'ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;',
            'CREATE POLICY "Signers can view own signatures" ON signatures FOR SELECT USING (auth.uid() = signer_id);',
            'CREATE POLICY "Users can sign documents" ON signatures FOR INSERT WITH CHECK (auth.uid() = signer_id);',
          )
        }

        schemaLines.push(
          '',
          'ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;',
          'CREATE POLICY "Users can view own sessions" ON sessions FOR SELECT USING (auth.uid() = user_id);',
        )

        if (payments !== 'none') {
          schemaLines.push(
            '',
            'ALTER TABLE payments ENABLE ROW LEVEL SECURITY;',
            'CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);',
          )
        }
      }

      const schema: GeneratedFile = {
        path: 'schema.sql',
        content: schemaLines.join('\n'),
      }

      const dbClient: GeneratedFile = {
        path: 'lib/db.ts',
        content:
          databaseProvider === 'supabase'
            ? `import { createClient } from '@supabase/supabase-js'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export const db = createClient(
  getEnv('SUPABASE_URL'),
  getEnv('SUPABASE_ANON_KEY')
)
`
            : `import postgres from 'postgres'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

const connString = getEnv('DATABASE_URL')
export const sql = postgres(connString, { ssl: 'require' })
`,
      }

      return [schema, dbClient]
    }

    case 'mysql': {
      const prismaSchema: GeneratedFile = {
        path: 'prisma/schema.prisma',
        content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  relationMode = "prisma"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}
`,
      }

      const dbClient: GeneratedFile = {
        path: 'lib/db.ts',
        content: `import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
`,
      }

      return [prismaSchema, dbClient]
    }

    case 'sqlite': {
      const dbClient: GeneratedFile = {
        path: 'lib/db.ts',
        content:
          databaseProvider === 'turso'
            ? `import { createClient } from '@libsql/client'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

export const db = createClient({
  url: getEnv('TURSO_DATABASE_URL'),
  authToken: process.env.TURSO_AUTH_TOKEN,
})
`
            : `import Database from 'better-sqlite3'
import path from 'node:path'

const dbPath = path.join(process.cwd(), 'data', 'app.db')
export const db = new Database(dbPath)
`,
      }

      return [dbClient]
    }

    case 'mongodb': {
      const dbClient: GeneratedFile = {
        path: 'lib/db.ts',
        content: `import mongoose from 'mongoose'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

const MONGODB_URI = getEnv('MONGODB_URI')

let cached = (globalThis as any).mongoose

if (!cached) {
  cached = (globalThis as any).mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false })
  }
  cached.conn = await cached.promise
  return cached.conn
}
`,
      }

      return [dbClient]
    }

    case 'dynamodb': {
      const dbClient: GeneratedFile = {
        path: 'lib/db.ts',
        content: `import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error('Missing required environment variable: ' + name)
  return val
}

const client = new DynamoDBClient({
  region: getEnv('AWS_REGION'),
  credentials: {
    accessKeyId: getEnv('AWS_ACCESS_KEY_ID'),
    secretAccessKey: getEnv('AWS_SECRET_ACCESS_KEY'),
  },
})

export const db = DynamoDBDocumentClient.from(client)
`,
      }

      return [dbClient]
    }
  }
}
