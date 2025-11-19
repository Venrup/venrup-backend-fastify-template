import { z } from 'zod'
import { BaseResponseSchema } from '../types/api'

export const LoginSchema = z.object({
  username: z.email(),
  password: z.string().min(8)
})

export const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8)
})

export const RefreshTokenSchema = z.object({
  refreshToken: z.string()
})

export const ChangePasswordSchema = z.object({
  newPassword: z.string().min(8)
})

// Response data schemas
const TokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  accessTokenExpiresAt: z.number(),
  refreshTokenExpiresAt: z.number()
})

const UserProfileSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string()
})

// Success response schemas
export const LoginResponseSchema = BaseResponseSchema.extend({
  success: z.literal(true),
  data: z.object({
    user: UserProfileSchema,
    ...TokensSchema.shape
  })
})

export const RegisterResponseSchema = LoginResponseSchema

export const RefreshTokenResponseSchema = BaseResponseSchema.extend({
  success: z.literal(true),
  data: TokensSchema
})

export const MessageResponseSchema = BaseResponseSchema.extend({
  success: z.literal(true),
  data: z.object({
    message: z.string()
  })
})

export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>
