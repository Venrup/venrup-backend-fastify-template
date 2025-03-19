import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { ErrorCodes, HttpStatusCodes } from '../errors/constants'
import { ApiError } from '../errors/ApiError'

export default function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Handle Fastify validation errors (e.g FST_ERR_VALIDATION)
  if (error.validation) {
    return reply.status(HttpStatusCodes[ErrorCodes.VALIDATION_ERROR]).send({
      success: false,
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: error.message || 'Validation error',
        details: error.validation.map((error) => ({
          message: error.message,
          field: error.instancePath
        }))
      }
    })
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return reply.status(HttpStatusCodes[ErrorCodes.VALIDATION_ERROR]).send({
      success: false,
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'Validation error',
        details: error.errors
      }
    })
  }

  // Handle our custom API errors
  if (error instanceof ApiError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    })
  }

  // Handle unknown errors
  return reply.status(HttpStatusCodes[ErrorCodes.INTERNAL_SERVER_ERROR]).send({
    success: false,
    error: {
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: error.message || 'Internal server error'
    }
  })
}
