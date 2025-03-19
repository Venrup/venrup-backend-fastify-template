import { db } from '../../db'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import type { UpdateAccountInfoInput } from '../../schemas/userSchema'
import { ApiError } from '../../errors/ApiError'
import { getUserById } from '../../db/requests/user/user'

export const updateAccountInfoService = async (
  userId: number,
  input: UpdateAccountInfoInput
) => {
  const { name } = input

  const [updatedUser] = await db
    .update(users)
    .set({ name })
    .where(eq(users.id, userId))
    .returning()

  if (!updatedUser) {
    throw ApiError.notFound('User not found')
  }

  const { password: _, ...sanatizedUser } = updatedUser

  return {
    ...sanatizedUser
  }
}

export const getUserService = async (id: number) => {
  const user = await getUserById(id)

  if (!user) {
    throw ApiError.notFound('User not found')
  }

  const { password: _, ...sanatizedUser } = user

  return {
    ...sanatizedUser
  }
}
