import 'dotenv/config'
import { env } from './env'
import Fastify from 'fastify'
import authRoutes from './routes/authRoutes'
import { authSchemas } from './schemas/authSchema'
import { authMiddleware } from './middleware/auth'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { version } from '../package.json'
import { userSchemas } from './schemas/userSchema'
import userRoutes from './routes/userRoutes'
import cors from '@fastify/cors'
import fastifyOauth2, { type OAuth2Namespace } from '@fastify/oauth2'

import type { User } from './utils/typeDefs'
import errorHandler from './plugins/errorHandler'
import { commonSchemas } from './types/api'
import logger, { loggerHooks } from './utils/logger'

declare module 'fastify' {
  interface FastifyRequest {
    user: User
  }
  export interface FastifyInstance {
    authenticate: any
    googleOAuth: OAuth2Namespace
  }
}

const fastify = Fastify()

// Register CORS
fastify.register(cors, { origin: '*', credentials: true })

// Middleware for authentication
fastify.decorate('authenticate', authMiddleware)

// Register all schemas
for (const schema of [
  ...commonSchemas,
  ...authSchemas,
  ...userSchemas,
]) {
  fastify.addSchema(schema)
}

// Register Swagger
const registerSwagger = async () => {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Fastify API',
        description: 'API documentation',
        version
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      security: [{ bearerAuth: [] }],
      tags: [
        { name: 'Authentication', description: 'Auth related endpoints' },
        { name: 'User', description: 'User management endpoints' },
      ]
    }
  })

  await fastify.register(swaggerUi, {
    routePrefix: '/api'
  })
}

registerSwagger()

// Register only the necessary hooks
fastify.addHook('preHandler', loggerHooks.preHandler)
fastify.addHook('onSend', loggerHooks.onSend)
fastify.addHook('onError', loggerHooks.onError)

fastify.get('/', async () => 'Hello there! 👋')

// Reigster google oauth
fastify.register(fastifyOauth2, {
  name: 'googleOAuth',
  scope: ['profile', 'email'],
  credentials: {
    client: {
      id: env.GOOGLE_CLIENT_ID,
      secret: env.GOOGLE_CLIENT_SECRET
    },
    auth: fastifyOauth2.GOOGLE_CONFIGURATION
  },
  startRedirectPath: '/auth/google',
  callbackUri: `${env.BACKEND_URL}/auth/google/callback`
})

// Routes
fastify.register(authRoutes, { prefix: '/auth' })
fastify.register(userRoutes, { prefix: '/user' })

// Error handler
fastify.setErrorHandler(errorHandler)

const start = async () => {
  try {
    const port = Number(env.PORT) || 3000

    await fastify.listen({
      port,
      host: '0.0.0.0'
    })
    logger.log(`fastify listening on port ${port}`)
  } catch (err) {
    logger.error(err)
    process.exit(1)
  }
}

start()
