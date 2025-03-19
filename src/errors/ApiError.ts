import { ErrorCodes, ErrorMessages, HttpStatusCodes } from './constants'

export class ApiError extends Error {
  public readonly code: keyof typeof ErrorCodes
  public readonly statusCode: number
  public readonly details?: any

  constructor(code: keyof typeof ErrorCodes, message?: string, details?: any) {
    super(message || ErrorMessages[code])
    this.code = code
    this.statusCode = HttpStatusCodes[code]
    this.details = details
    this.name = 'ApiError'
  }

  public static unauthorized(message?: string, details?: any) {
    return new ApiError(ErrorCodes.UNAUTHORIZED, message, details)
  }

  public static forbidden(message?: string, details?: any) {
    return new ApiError(ErrorCodes.FORBIDDEN, message, details)
  }

  public static notFound(message?: string, details?: any) {
    return new ApiError(ErrorCodes.NOT_FOUND, message, details)
  }

  public static alreadyExists(message?: string, details?: any) {
    return new ApiError(ErrorCodes.ALREADY_EXISTS, message, details)
  }

  public static badRequest(message?: string, details?: any) {
    return new ApiError(ErrorCodes.BAD_REQUEST, message, details)
  }

  public static validationError(message?: string, details?: any) {
    return new ApiError(ErrorCodes.VALIDATION_ERROR, message, details)
  }

  public static internalServerError(message?: string, details?: any) {
    return new ApiError(ErrorCodes.INTERNAL_SERVER_ERROR, message, details)
  }
}
