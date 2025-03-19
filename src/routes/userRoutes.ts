import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { updateAccountInfoService, getUserService } from '../services/user'
import { $ref, type UpdateAccountInfoInput } from '../schemas/userSchema'

import { commonRef } from '../types/api'

const userRoutes = async (fastify: FastifyInstance) => {
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
          200: $ref('GetUserResponseSchema'),
          401: commonRef('UnauthorizedErrorResponse'),
          404: commonRef('NotFoundErrorResponse'),
          500: commonRef('InternalServerErrorResponse')
        }
      }
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
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
        body: $ref('UpdateAccountInfoSchema'),
        response: {
          200: $ref('UpdateUserResponseSchema'),
          401: commonRef('UnauthorizedErrorResponse'),
          404: commonRef('NotFoundErrorResponse'),
          422: commonRef('ValidationErrorResponse'),
          500: commonRef('InternalServerErrorResponse')
        }
      }
    },
    async (
      request: FastifyRequest<{ Body: UpdateAccountInfoInput }>,
      reply: FastifyReply
    ) => {
      const data = await updateAccountInfoService(request.user.id, request.body)
      return await reply.send({ success: true, data })
    }
  )
}

export default userRoutes
