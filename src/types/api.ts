import { z } from 'zod'

export const FastifyValidationDetailSchema = z.object({
  message: z.string(),
  field: z.string()
})
export const ZodIssueDetailSchema = z.object({
  code: z.string(),
  message: z.string(),
  path: z.array(z.union([z.string(), z.number()])).optional(),
  expected: z.string().optional(),
  received: z.string().optional()
})
export const ValidationErrorDetailsSchema = z.array(
  z.union([FastifyValidationDetailSchema, ZodIssueDetailSchema])
)

export const BaseErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.any().optional()
})

export const BaseResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional()
})

export const ValidationErrorSchema = z.object({
  success: z.literal(false),
  error: BaseErrorSchema.extend({
    code: z.literal('VALIDATION_ERROR'),
    details: ValidationErrorDetailsSchema.optional()
  })
})

export const BadRequestErrorSchema = z.object({
  success: z.literal(false),
  error: BaseErrorSchema.extend({
    code: z.literal('BAD_REQUEST')
  })
})

export const NotFoundErrorSchema = z.object({
  success: z.literal(false),
  error: BaseErrorSchema.extend({
    code: z.literal('NOT_FOUND')
  })
})

export const UnauthorizedErrorSchema = z.object({
  success: z.literal(false),
  error: BaseErrorSchema.extend({
    code: z.literal('UNAUTHORIZED')
  })
})

export const ForbiddenErrorSchema = z.object({
  success: z.literal(false),
  error: BaseErrorSchema.extend({
    code: z.literal('FORBIDDEN')
  })
})

export const ConflictErrorSchema = z.object({
  success: z.literal(false),
  error: BaseErrorSchema.extend({
    code: z.literal('ALREADY_EXISTS')
  })
})

export const InternalServerErrorSchema = z.object({
  success: z.literal(false),
  error: BaseErrorSchema.extend({
    code: z.literal('INTERNAL_SERVER_ERROR')
  })
})
