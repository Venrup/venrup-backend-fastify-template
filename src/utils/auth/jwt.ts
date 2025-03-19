import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import type { User } from '../typeDefs'
import { env } from '../../env'
import { TOKEN_CONFIG } from '../constants/tokens'

dotenv.config()

const { JWT_SECRET_KEY, JWT_REFRESH_TOKEN_KEY } = env

type TokenPayload = Record<string, any>

export const generateAccessToken = (payload: TokenPayload) =>
  jwt.sign(payload, JWT_SECRET_KEY, {
    expiresIn: TOKEN_CONFIG.access.value as any
  })

export const generateRefreshToken = (payload: TokenPayload) =>
  jwt.sign(payload, JWT_REFRESH_TOKEN_KEY, {
    expiresIn: TOKEN_CONFIG.refresh.value as any
  })

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, JWT_SECRET_KEY) as User

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, JWT_REFRESH_TOKEN_KEY) as User

export const getTokenExpiryTimes = () => ({
  accessTokenExpiresAt: Date.now() + TOKEN_CONFIG.access.milliseconds,
  refreshTokenExpiresAt: Date.now() + TOKEN_CONFIG.refresh.milliseconds
})
