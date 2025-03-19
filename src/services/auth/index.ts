import { db } from '../../db'
import { users } from '../../db/schema'
import { eq, sql } from 'drizzle-orm'
import { hashPassword, comparePassword } from '../../utils/auth/bcrypt'
import { verifyRefreshToken } from '../../utils/auth/jwt'
import type { RegisterInput, LoginInput } from '../../schemas/authSchema'
import { env } from '../../env'
import { ApiError } from '../../errors/ApiError'
import {
  deleteRefreshToken,
  getRefreshTokenByToken
} from '../../db/requests/refresh-token'
import { generateAuthTokens } from '../../utils/auth/generateAuthTokens'

const frontendUrl = env.FRONTEND_URL

interface GoogleUserInput {
  googleId: string
  email: string
  name: string
}
export const handleGoogleAuthService = async (input: GoogleUserInput) => {
  const { googleId, email, name } = input

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (existingUser) {
    if (!existingUser.isOAuthUser) {
      throw ApiError.forbidden(
        'Your email is registered with a manual signup. Please sign in using your email and password to continue.'
      )
    }

    const { password: _, ...sanitizedUser } = existingUser

    const tokens = await generateAuthTokens(existingUser.id, existingUser.email)

    return {
      user: { ...sanitizedUser, subscription: null },
      ...tokens
    }
  } else {
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name,
        oauthId: googleId,
        isOAuthUser: true,
        password: ''
      })
      .returning()

    const { password: _, ...sanitizedUser } = newUser

    const tokens = await generateAuthTokens(newUser.id, newUser.email)

    return {
      user: { ...sanitizedUser },
      ...tokens
    }
  }
}

export const registerUserService = async (input: RegisterInput) => {
  const { email, password, name } = input

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (existingUser) {
    throw ApiError.alreadyExists(
      'An account with this email already exists. Please log in to continue.'
    )
  }

  const hashedPassword = await hashPassword(password)

  const [newUser] = await db
    .insert(users)
    .values({
      email,
      password: hashedPassword,
      name
    })
    .returning()

  const { password: _, ...sanitizedUser } = newUser

  const tokens = await generateAuthTokens(newUser.id, newUser.email)

  return {
    user: { ...sanitizedUser },
    ...tokens
  }
}

export const loginUserService = async (input: LoginInput) => {
  const { username, password } = input

  const [user] = await db.select().from(users).where(eq(users.email, username))

  if (!user) {
    throw ApiError.notFound(
      'The email address or password is incorrect. Please try again.'
    )
  }

  if (user.isOAuthUser) {
    throw ApiError.forbidden(
      'This email is already associated with a Google account. Please sign in using Google Authentication.'
    )
  }

  const isPasswordValid = await comparePassword(password, user.password)
  if (!isPasswordValid) {
    throw ApiError.forbidden(
      'The email address or password is incorrect. Please try again.'
    )
  }

  const { password: _, ...sanatizedUser } = user

  const tokens = await generateAuthTokens(user.id, user.email)

  return {
    user: {
      ...sanatizedUser
    },
    ...tokens
  }
}

export const refreshTokenService = async (oldRefreshToken: string) => {
  const storedToken = await getRefreshTokenByToken(oldRefreshToken)

  if (!storedToken) {
    throw ApiError.unauthorized()
  }

  let payload
  try {
    payload = verifyRefreshToken(oldRefreshToken)
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      await deleteRefreshToken(oldRefreshToken)
      throw ApiError.unauthorized(
        'Refresh token has expired, please login again'
      )
    }
    throw ApiError.unauthorized()
  }

  const data = await generateAuthTokens(payload.id, payload.email)

  return data
}

export const changePasswordService = async (
  userId: number,
  newPassword: string
) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    throw ApiError.notFound('Could not find user with the provided ID')
  }

  if (user.isOAuthUser) {
    throw ApiError.forbidden('Password change not available for OAuth users')
  }

  const hashedPassword = await hashPassword(newPassword)

  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, userId))

  return { message: 'Password updated successfully' }
}

export const deleteAccountService = async (userId: number) => {
  await db.transaction(async (trx) => {
    // Acquire advisory lock based on the user id
    await trx.execute(
      sql`SELECT pg_advisory_xact_lock(hashtext(${userId}::TEXT));`
    )

    const [user] = await trx
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) {
      throw ApiError.notFound('Could not find user')
    }

    await trx
      .update(users)
      .set({
        email: `${Date.now()}_${user.email}`,
        deletedAt: new Date()
      })
      .where(eq(users.id, userId))
  })

  return { message: 'Account has been deleted successfully' }
}
