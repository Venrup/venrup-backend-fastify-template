import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError, ZodIssue } from 'zod'
import { ErrorCodes, HttpStatusCodes } from '../errors/constants'
import { ApiError } from '../errors/ApiError'
import { fromError } from 'zod-validation-error'

export default function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  let errorResponse: any

  if (error.validation) {
    errorResponse = {
      success: false,
      error: {
        statusCode: HttpStatusCodes[ErrorCodes.VALIDATION_ERROR], // Explicit statusCode
        code: ErrorCodes.VALIDATION_ERROR,
        message: error.message || 'Request validation failed',
        details: error.validation.map((fastifyErrorDetail) => ({
          message: fastifyErrorDetail.message,
          field: fastifyErrorDetail.instancePath.replace(/^\//, '') // Remove leading slash, e.g., "/body/name" -> "body/name" or "name"
        }))
      }
    }
    return reply.status(errorResponse.error.statusCode).send(errorResponse)
  }

  if (error instanceof ZodError) {
    const consolidatedMessage = fromError(error, {
      prefix: 'Input validation failed',
      issueSeparator: '\n'
    }).message

    errorResponse = {
      success: false,
      error: {
        statusCode: HttpStatusCodes[ErrorCodes.VALIDATION_ERROR],
        code: ErrorCodes.VALIDATION_ERROR,
        message: consolidatedMessage,
        details: error.issues.map((issue) => {
          const detail: any = {
            code: issue.code,
            message: issue.message,
            path: issue.path
          }
          if ('expected' in issue) {
            detail.expected = issue.expected
          }
          if ('received' in issue) {
            detail.received = issue.received
          }
          return detail
        })
      }
    }
    return reply.status(errorResponse.error.statusCode).send(errorResponse)
  }

  // Handle our custom API errors
  if (error instanceof ApiError) {
    errorResponse = {
      success: false,
      error: {
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
        details: error.details
      }
    }
    return reply.status(errorResponse.error.statusCode).send(errorResponse)
  }

  // Handle unknown errors (generic 500)
  errorResponse = {
    success: false,
    error: {
      statusCode: HttpStatusCodes[ErrorCodes.INTERNAL_SERVER_ERROR],
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: error.message || 'Internal server error'
    }
  }
  return reply.status(errorResponse.error.statusCode).send(errorResponse)
}
