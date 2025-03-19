import { db } from '../../index'
import { refreshTokens } from '../../schema'
import { and, eq, gte, isNull } from 'drizzle-orm'
import { TOKEN_CONFIG } from '../../../utils/constants/tokens'

export const createRefreshToken = async (token: string, userId: number) => {
  const expiresAt = new Date(Date.now() + TOKEN_CONFIG.refresh.milliseconds)

  const [refreshToken] = await db
    .insert(refreshTokens)
    .values({
      token,
      userId,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning()

  return refreshToken
}

export const getRefreshTokenByToken = async (token: string) => {
  const [refreshToken] = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.token, token),
        eq(refreshTokens.hasAccess, true),
        isNull(refreshTokens.deletedAt),
        gte(refreshTokens.expiresAt, new Date())
      )
    )
    .limit(1)

  return refreshToken || null
}

export const deleteRefreshToken = async (token: string) => {
  await db.delete(refreshTokens).where(eq(refreshTokens.token, token))
}
