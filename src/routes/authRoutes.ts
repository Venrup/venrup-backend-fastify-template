import {
  registerUserService,
  loginUserService,
  refreshTokenService,
  changePasswordService,
  deleteAccountService,
  handleGoogleAuthService
} from '../services/auth'
import { env } from '../env'
import logger from '../utils/logger'
import { ApiError } from '../errors/ApiError'
import { FastifyPluginAsyncZodOpenApi } from 'fastify-zod-openapi'
import {
  ChangePasswordSchema,
  LoginResponseSchema,
  LoginSchema,
  MessageResponseSchema,
  RefreshTokenResponseSchema,
  RefreshTokenSchema,
  RegisterResponseSchema,
  RegisterSchema
} from '../schemas/authSchema'
import {
  ConflictErrorSchema,
  ForbiddenErrorSchema,
  InternalServerErrorSchema,
  UnauthorizedErrorSchema,
  ValidationErrorSchema
} from '../types/api'

export const authRoutes: FastifyPluginAsyncZodOpenApi = async (fastify) => {
  fastify.post(
    '/register',
    {
      schema: {
        description: 'Register a new user account',
        tags: ['Authentication'],
        body: RegisterSchema,
        response: {
          201: RegisterResponseSchema,
          409: ConflictErrorSchema,
          422: ValidationErrorSchema,
          500: InternalServerErrorSchema
        }
      }
    },
    async (request, reply) => {
      const data = await registerUserService(request.body)
      return await reply.send({ success: true, data })
    }
  )

  fastify.post(
    '/login',
    {
      schema: {
        description: 'Authenticate user and get access token',
        tags: ['Authentication'],
        body: LoginSchema,
        response: {
          200: LoginResponseSchema,
          401: UnauthorizedErrorSchema,
          403: ForbiddenErrorSchema,
          422: ValidationErrorSchema,
          500: InternalServerErrorSchema
        }
      }
    },
    async (request, reply) => {
      const data = await loginUserService(request.body)
      return await reply.send({ success: true, data })
    }
  )

  fastify.post(
    '/refresh-token',
    {
      schema: {
        description: 'Refresh access token using refresh token',
        tags: ['Authentication'],
        body: RefreshTokenSchema,
        response: {
          200: RefreshTokenResponseSchema,
          401: UnauthorizedErrorSchema,
          500: InternalServerErrorSchema
        }
      }
    },
    async (request, reply) => {
      const data = await refreshTokenService(request.body.refreshToken)
      return await reply.send({ success: true, data })
    }
  )

  fastify.post(
    '/change-password',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Change user password (requires authentication)',
        tags: ['Authentication'],
        body: ChangePasswordSchema,
        response: {
          200: MessageResponseSchema,
          401: UnauthorizedErrorSchema,
          403: ForbiddenErrorSchema,
          422: ValidationErrorSchema,
          500: InternalServerErrorSchema
        }
      }
    },
    async (request, reply) => {
      const data = await changePasswordService(
        request.user.id,
        request.body.newPassword
      )
      return await reply.send({ success: true, data })
    }
  )

  fastify.delete(
    '/delete-account',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Delete user account (requires authentication)',
        tags: ['Authentication'],
        response: {
          200: MessageResponseSchema,
          401: UnauthorizedErrorSchema,
          500: InternalServerErrorSchema
        }
      }
    },
    async (request, reply) => {
      const data = await deleteAccountService(request.user.id)
      return await reply.send({ success: true, data })
    }
  )

  fastify.get(
    '/google/callback',
    {
      schema: {
        description: 'Google OAuth callback handler',
        tags: ['Authentication'],
        response: {
          302: {
            description: 'Redirect to frontend with auth data',
            type: 'null'
          },
          500: InternalServerErrorSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const { token } =
          await fastify.googleOAuth.getAccessTokenFromAuthorizationCodeFlow(
            request
          )

        const response = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: { Authorization: `Bearer ${token.access_token}` }
          }
        )
        type ProfileType = {
          sub: string
          email: string
          given_name: string
          family_name: string
        }

        const profile = (await response.json()) as ProfileType

        const authResponse = await handleGoogleAuthService({
          googleId: profile.sub,
          email: profile.email,
          name: `${profile.given_name} ${profile.family_name}`
        })

        const serializedAuthResponse = encodeURIComponent(
          JSON.stringify(authResponse)
        )

        reply.redirect(
          `${env.FRONTEND_URL}/oauth-callback?response=${serializedAuthResponse}`
        )
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : 'Something went wrong, try again later'
        logger.error(message, error)
        const errorResponse = encodeURIComponent(
          JSON.stringify({ error: message })
        )
        reply.redirect(
          `${env.FRONTEND_URL}/oauth-callback?error=${errorResponse}`
        )
      }
    }
  )
}

export default authRoutes
