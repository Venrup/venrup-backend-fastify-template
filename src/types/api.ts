import { z } from 'zod'

// Build schemas for swagger
import { buildJsonSchemas } from 'fastify-zod'

export const BaseErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.any().optional()
})

// Base response structure
export const BaseResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional()
})

// Common response schemas that can be reused across the application
export const CommonResponseSchemas = {
  ValidationError: z.object({
    success: z.literal(false),
    error: BaseErrorSchema.extend({
      code: z.literal('VALIDATION_ERROR'),
      details: z.array(
        z.object({
          field: z.string(),
          message: z.string()
        })
      )
    })
  }),

  BadRequestError: z.object({
    success: z.literal(false),
    error: BaseErrorSchema.extend({
      code: z.literal('BAD_REQUEST')
    })
  }),

  NotFoundError: z.object({
    success: z.literal(false),
    error: BaseErrorSchema.extend({
      code: z.literal('NOT_FOUND')
    })
  }),

  UnauthorizedError: z.object({
    success: z.literal(false),
    error: BaseErrorSchema.extend({
      code: z.literal('UNAUTHORIZED')
    })
  }),

  ForbiddenError: z.object({
    success: z.literal(false),
    error: BaseErrorSchema.extend({
      code: z.literal('FORBIDDEN')
    })
  }),

  ConflictError: z.object({
    success: z.literal(false),
    error: BaseErrorSchema.extend({
      code: z.literal('ALREADY_EXISTS')
    })
  }),

  InternalServerError: z.object({
    success: z.literal(false),
    error: BaseErrorSchema.extend({
      code: z.literal('INTERNAL_SERVER_ERROR')
    })
  })
}

export const { schemas: commonSchemas, $ref: commonRef } = buildJsonSchemas(
  {
    ValidationErrorResponse: CommonResponseSchemas.ValidationError,
    BadRequestErrorResponse: CommonResponseSchemas.BadRequestError,
    NotFoundErrorResponse: CommonResponseSchemas.NotFoundError,
    UnauthorizedErrorResponse: CommonResponseSchemas.UnauthorizedError,
    ForbiddenErrorResponse: CommonResponseSchemas.ForbiddenError,
    ConflictErrorResponse: CommonResponseSchemas.ConflictError,
    InternalServerErrorResponse: CommonResponseSchemas.InternalServerError
  },
  { $id: 'common' }
)
