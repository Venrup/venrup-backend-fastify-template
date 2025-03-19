import type { FastifyInstance, FastifyRequest } from 'fastify'
import {
  registerUserService,
  loginUserService,
  refreshTokenService,
  changePasswordService,
  deleteAccountService,
  handleGoogleAuthService
} from '../services/auth'
import {
  $ref,
  type RegisterInput,
  type LoginInput,
  type RefreshTokenInput,
  type ChangePasswordInput
} from '../schemas/authSchema'
import { env } from '../env'
import { commonRef } from '../types/api'
import logger from '../utils/logger'
import { ApiError } from '../errors/ApiError'

const authRoutes = async (fastify: FastifyInstance) => {
  fastify.post(
    '/register',
    {
      schema: {
        description: 'Register a new user account',
        tags: ['Authentication'],
        body: $ref('RegisterSchema'),
        response: {
          201: $ref('RegisterResponseSchema'),
          409: commonRef('ConflictErrorResponse'),
          422: commonRef('ValidationErrorResponse'),
          500: commonRef('InternalServerErrorResponse')
        }
      }
    },
    async (request: FastifyRequest<{ Body: RegisterInput }>, reply) => {
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
        body: $ref('LoginSchema'),
        response: {
          200: $ref('LoginResponseSchema'),
          401: commonRef('UnauthorizedErrorResponse'),
          403: commonRef('ForbiddenErrorResponse'),
          422: commonRef('ValidationErrorResponse'),
          500: commonRef('InternalServerErrorResponse')
        }
      }
    },
    async (request: FastifyRequest<{ Body: LoginInput }>, reply) => {
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
        body: $ref('RefreshTokenSchema'),
        response: {
          200: $ref('RefreshTokenResponseSchema'),
          401: commonRef('UnauthorizedErrorResponse'),
          500: commonRef('InternalServerErrorResponse')
        }
      }
    },
    async (request: FastifyRequest<{ Body: RefreshTokenInput }>, reply) => {
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
        body: $ref('ChangePasswordSchema'),
        response: {
          200: $ref('MessageResponseSchema'),
          401: commonRef('UnauthorizedErrorResponse'),
          403: commonRef('ForbiddenErrorResponse'),
          422: commonRef('ValidationErrorResponse'),
          500: commonRef('InternalServerErrorResponse')
        }
      }
    },
    async (request: FastifyRequest<{ Body: ChangePasswordInput }>, reply) => {
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
          200: $ref('MessageResponseSchema'),
          401: commonRef('UnauthorizedErrorResponse'),
          500: commonRef('InternalServerErrorResponse')
        }
      }
    },
    async (request: FastifyRequest, reply) => {
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
          500: commonRef('InternalServerErrorResponse')
        }
      }
    },
    async (request: FastifyRequest, reply) => {
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
        const profile = await response.json()

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
