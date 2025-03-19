import { createRefreshToken } from '../../db/requests/refresh-token'
import {
  generateAccessToken,
  generateRefreshToken,
  getTokenExpiryTimes
} from './jwt'
import { v4 as uuidv4 } from 'uuid'

export const generateAuthTokens = async (userId: number, email: string) => {
  const accessToken = generateAccessToken({
    id: userId,
    email,
    uuid: uuidv4()
  })
  const refreshToken = generateRefreshToken({
    id: userId,
    email,
    uuid: uuidv4()
  })

  await createRefreshToken(refreshToken, userId)

  const { accessTokenExpiresAt, refreshTokenExpiresAt } = getTokenExpiryTimes()

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt
  }
}
