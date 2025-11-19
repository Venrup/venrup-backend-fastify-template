import 'dotenv/config'
import { env } from './env'
import Fastify from 'fastify'
import { authMiddleware } from './middleware/auth'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { version } from '../package.json'
import cors from '@fastify/cors'
import fastifyOauth2, { type OAuth2Namespace } from '@fastify/oauth2'

import type { User } from './utils/typeDefs'
import errorHandler from './plugins/errorHandler'
import logger, { loggerHooks } from './utils/logger'
import {
  fastifyZodOpenApiPlugin,
  fastifyZodOpenApiTransformers,
  FastifyZodOpenApiTypeProvider,
  serializerCompiler,
  validatorCompiler
} from 'fastify-zod-openapi'

import { authRoutes } from './routes/authRoutes'
import { userRoutes } from './routes/userRoutes'

declare module 'fastify' {
  interface FastifyRequest {
    user: User
  }
  export interface FastifyInstance {
    authenticate: any
    googleOAuth: OAuth2Namespace
  }
}

const app = Fastify()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

const fastify = app.withTypeProvider<FastifyZodOpenApiTypeProvider>()

// Register Swagger
const registerSwagger = async () => {
  await app.register(swagger, {
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
      security: [{ bearerAuth: [] }]
    },
    ...fastifyZodOpenApiTransformers
  })

  await app.register(swaggerUi, {
    routePrefix: '/api',
    staticCSP: false,
    transformSpecification: (swaggerObject) => swaggerObject,
    transformSpecificationClone: true
  })
}

fastify.get('/', async () => 'Hello there! 👋')

const start = async () => {
  try {
    const port = env.PORT

    await fastify.register(fastifyZodOpenApiPlugin)

    await registerSwagger()

    // Register CORS
    await fastify.register(cors, { origin: '*', credentials: true })

    // Reigster google oauth
    await fastify.register(fastifyOauth2, {
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

    // Decorators
    fastify.decorate('authenticate', authMiddleware)

    // Error handler
    fastify.setErrorHandler(errorHandler)

    // Routes
    await fastify.register(authRoutes, { prefix: '/auth' })
    await fastify.register(userRoutes, { prefix: '/user' })

    // Register only the necessary hooks
    fastify.addHook('preHandler', loggerHooks.preHandler)
    fastify.addHook('onSend', loggerHooks.onSend)
    fastify.addHook('onError', loggerHooks.onError)

    await app.listen({
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
