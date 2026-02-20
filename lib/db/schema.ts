import { pgTable, varchar, text, timestamp, integer, boolean, uuid, decimal } from 'drizzle-orm/pg-core';

export const mcpServers = pgTable('mcp_servers', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  tagline: varchar('tagline', { length: 255 }).notNull(),
  description: text('description').notNull(),
  
  category: varchar('category', { length: 100 }).notNull(),
  protocol: varchar('protocol', { length: 50 }).default('MCP').notNull(),
  
  githubUrl: varchar('github_url', { length: 500 }),
  npmPackage: varchar('npm_package', { length: 255 }),
  installCommand: varchar('install_command', { length: 500 }),
  
  authorName: varchar('author_name', { length: 255 }).notNull(),
  authorEmail: varchar('author_email', { length: 255 }).notNull(),
  
  viewCount: integer('view_count').default(0).notNull(),
  installCount: integer('install_count').default(0).notNull(),
  
  ratingAvg: varchar('rating_avg', { length: 10 }).default('0.00'),
  ratingCount: integer('rating_count').default(0).notNull(),
  
  isVerified: boolean('is_verified').default(false).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  
  status: varchar('status', { length: 50 }).default('pending'),
  claimToken: varchar('claim_token', { length: 255 }),
  claimedAt: timestamp('claimed_at'),
  ownerEmail: varchar('owner_email', { length: 255 }),
  weeklyViewSnapshot: integer('weekly_view_snapshot').default(0),
  weeklySnapshotAt: timestamp('weekly_snapshot_at'),
});

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }),
});

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  serverId: uuid('server_id').notNull(),
  userId: uuid('user_id'),
  reviewerName: varchar('reviewer_name', { length: 255 }),
  reviewerEmail: varchar('reviewer_email', { length: 255 }),
  rating: integer('rating').notNull(),
  comment: text('comment'),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull(),
  avatar: varchar('avatar', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const waitlist = pgTable('waitlist', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  source: varchar('source', { length: 100 }).default('homepage'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const serverTags = pgTable('server_tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  serverId: uuid('server_id').notNull().references(() => mcpServers.id, { onDelete: 'cascade' }),
  tag: varchar('tag', { length: 50 }).notNull(),
});