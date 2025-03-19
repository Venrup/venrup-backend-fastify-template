export const ErrorCodes = {
  BAD_REQUEST: 'BAD_REQUEST', // General invalid request
  UNAUTHORIZED: 'UNAUTHORIZED', // No token or invalid token format
  FORBIDDEN: 'FORBIDDEN', // User lacks permission
  NOT_FOUND: 'NOT_FOUND', // Resource doesn't exist
  ALREADY_EXISTS: 'ALREADY_EXISTS', // Resource creation conflict
  VALIDATION_ERROR: 'VALIDATION_ERROR', // Schema validation failure
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
} as const

export const ErrorMessages = {
  [ErrorCodes.BAD_REQUEST]: 'Invalid request parameters',
  [ErrorCodes.UNAUTHORIZED]: 'Unauthorized access. Please log in to continue',
  [ErrorCodes.FORBIDDEN]: 'You do not have permission to perform this action',
  [ErrorCodes.NOT_FOUND]: 'The requested resource was not found',
  [ErrorCodes.ALREADY_EXISTS]: 'Resource already exists',
  [ErrorCodes.VALIDATION_ERROR]: 'Request validation failed',
  [ErrorCodes.INTERNAL_SERVER_ERROR]:
    "Something went wrong on our end. We're working to fix it! Please try again later."
} as const

export const HttpStatusCodes = {
  [ErrorCodes.BAD_REQUEST]: 400,
  [ErrorCodes.UNAUTHORIZED]: 401, // Missing / invalid token - triggers refresh flow
  [ErrorCodes.FORBIDDEN]: 403, // Insufficient permissions
  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.ALREADY_EXISTS]: 409,
  [ErrorCodes.VALIDATION_ERROR]: 422, // Unprocessable Entity - for validation errors
  [ErrorCodes.INTERNAL_SERVER_ERROR]: 500
} as const
