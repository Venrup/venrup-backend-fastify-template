import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  pgEnum
} from 'drizzle-orm/pg-core'
import { timestamps } from './helpers/timestamps'
import { enumToPgEnum } from './helpers/enumToPgEnum'

export enum UserRole {
  STUDENT = 'student',
  TUTOR = 'tutor',
  ADMIN = 'admin'
}

export const userRoleEnum = pgEnum('user_role', enumToPgEnum(UserRole))

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  role: userRoleEnum('role').notNull().default(UserRole.STUDENT),

  oauthId: text('oauth_id'),
  isOAuthUser: boolean('is_oauth_user').default(false),

  ...timestamps
})

export const refreshTokens = pgTable('refresh_tokens', {
  id: serial('id').primaryKey(),
  token: text('token').notNull().unique(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade'
    }),
  hasAccess: boolean('has_access').notNull().default(true),
  expiresAt: timestamp('expires_at'),

  ...timestamps
})
