import type { FastifyReply, FastifyRequest } from 'fastify'
import { verifyAccessToken } from '../utils/auth/jwt'
import { ApiError } from '../errors/ApiError'

export const authMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const authHeader = request.headers.authorization
  if (!authHeader) {
    throw ApiError.unauthorized()
  }

  const token = authHeader.split(' ')[1]

  try {
    const user = verifyAccessToken(token)
    request.user = user
  } catch (error) {
    throw ApiError.unauthorized()
  }
}
