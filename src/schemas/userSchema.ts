import { z } from 'zod'
import { BaseResponseSchema } from '../types/api'

// Request schemas
export const UpdateAccountInfoSchema = z.object({
  name: z.string().min(2)
})

// Response schemas
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string()
})

export const GetUserResponseSchema = BaseResponseSchema.extend({
  success: z.literal(true),
  data: UserSchema
})

export const UpdateUserResponseSchema = GetUserResponseSchema

// Types
export type UpdateAccountInfoInput = z.infer<typeof UpdateAccountInfoSchema>
export type User = z.infer<typeof UserSchema>
