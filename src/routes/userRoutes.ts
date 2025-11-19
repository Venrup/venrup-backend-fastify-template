import { updateAccountInfoService, getUserService } from '../services/user'
import {
  GetUserResponseSchema,
  UpdateAccountInfoSchema,
  UpdateUserResponseSchema
} from '../schemas/userSchema'
import {
  InternalServerErrorSchema,
  NotFoundErrorSchema,
  UnauthorizedErrorSchema,
  ValidationErrorSchema
} from '../types/api'
import { FastifyPluginAsyncZodOpenApi } from 'fastify-zod-openapi'

export const userRoutes: FastifyPluginAsyncZodOpenApi = async (fastify) => {
  const routeOptions = {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['User']
    }
  }

  // get logged in user profile
  fastify.get(
    '/me',
    {
      ...routeOptions,
      schema: {
        ...routeOptions.schema,
        description: 'Get current user profile',
        response: {
          200: GetUserResponseSchema,
          401: UnauthorizedErrorSchema,
          404: NotFoundErrorSchema,
          500: InternalServerErrorSchema
        }
      }
    },
    async (request, reply) => {
      const data = await getUserService(request.user.id)
      return await reply.send({ success: true, data })
    }
  )

  fastify.put(
    '/update-account-info',
    {
      ...routeOptions,
      schema: {
        ...routeOptions.schema,
        description: 'Update current user account information',
        body: UpdateAccountInfoSchema,
        response: {
          200: UpdateUserResponseSchema,
          401: UnauthorizedErrorSchema,
          404: NotFoundErrorSchema,
          422: ValidationErrorSchema,
          500: InternalServerErrorSchema
        }
      }
    },
    async (request, reply) => {
      const data = await updateAccountInfoService(request.user.id, request.body)
      return await reply.send({ success: true, data })
    }
  )
}
