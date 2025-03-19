import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'
import { env } from './env'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL
  },
  migrations: {
    table: '__drizzle_migrations',
    schema: 'public'
  }
})
