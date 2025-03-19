import type { db } from '../db'

export interface User {
  id: number
  email: string
}

export type DrizzleTransaction = Parameters<
  Parameters<typeof db.transaction>[0]
>[0]
