import { env } from '../../env'

export interface TokenExpiry {
  value: string
  milliseconds: number
}

function parseExpiryString(expiry: string): TokenExpiry {
  const [value, unit] = (/(\d+)([a-z])/i.exec(expiry))?.slice(1) || []
  const number = parseInt(value, 10)

  let milliseconds: number
  switch (unit.toLowerCase()) {
    case 's':
      milliseconds = number * 1000
      break
    case 'm':
      milliseconds = number * 60 * 1000
      break
    case 'h':
      milliseconds = number * 60 * 60 * 1000
      break
    case 'd':
      milliseconds = number * 24 * 60 * 60 * 1000
      break
    default:
      throw new Error(`Invalid expiry unit: ${unit}`)
  }

  return {
    value: expiry,
    milliseconds
  }
}

export const TOKEN_CONFIG = {
  access: parseExpiryString(env.JWT_ACCESS_TOKEN_EXPIRY),
  refresh: parseExpiryString(env.JWT_REFRESH_TOKEN_EXPIRY)
} as const
