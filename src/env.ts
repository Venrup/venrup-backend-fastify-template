import { z } from 'zod'
import logger from './utils/logger'

const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().transform(Number).default('8000'),
  BACKEND_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_SECRET_KEY: z.string().min(32),
  JWT_REFRESH_TOKEN_KEY: z.string().min(32),
  JWT_ACCESS_TOKEN_EXPIRY: z.string().default('5m'),
  JWT_REFRESH_TOKEN_EXPIRY: z.string().default('7d'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string()
})

// Validate env variables when the app starts
const validateEnv = () => {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      )
      logger.error('Invalid environment variables:\n', missingVars.join('\n'))
      process.exit(1)
    }

    throw error
  }
}

// Export validated environment variables
export const env = validateEnv()

// Export type of validated env
export type Env = z.infer<typeof envSchema>
