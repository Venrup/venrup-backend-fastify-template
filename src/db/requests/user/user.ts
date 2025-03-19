import { eq } from 'drizzle-orm'
import { db } from '../../index'
import { users } from '../../schema'

export const getUserById = async (userId: number) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return user || null
}
