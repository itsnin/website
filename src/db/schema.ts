// ============================================================================
// schema.ts — Drizzle ORM schema for NiN.X.
// ----------------------------------------------------------------------------
// This schema defines every persistence concern for the site. It's written
// with Drizzle's relational API so it works with BOTH the bun-sqlite driver
// (local dev) and the d1 driver (Cloudflare production). Swapping drivers
// is a one-line change in db/index.ts — the schema stays identical.
//
// Docs:
//   - Drizzle SQLite columns: https://orm.drizzle.team/docs/column-types/sqlite
//   - Drizzle relations: https://orm.drizzle.team/docs/rqb
// ==========================================================================
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// ----------------------------------------------------------------------------
// USER — every account on NiN.X.
// Includes the Auth.js (NextAuth) fields (emailVerified, image) plus our
// custom fields (role, provider, banned).
// ----------------------------------------------------------------------------
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "timestamp_ms" }),
  image: text("image"),
  // passwordHash — null for OAuth-only accounts.
  passwordHash: text("password_hash"),
  // provider — records how the account was created (EMAIL / GOOGLE / APPLE).
  provider: text("provider").notNull().default("EMAIL"),
  providerId: text("provider_id"),
  role: text("role").notNull().default("MEMBER"),
  banned: integer("banned", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  articles: many(articles),
  threads: many(forumThreads),
  replies: many(forumReplies),
}));

// ----------------------------------------------------------------------------
// ACCOUNT + SESSION + VERIFICATIONTOKEN — required by Auth.js (NextAuth)
// with the Drizzle adapter. These tables store OAuth account linkage,
// sessions, and email verification tokens.
// Docs: https://authjs.dev/getting-started/adapters/drizzle
// ----------------------------------------------------------------------------
export const accounts = sqliteTable("accounts", {
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = sqliteTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

export const verificationTokens = sqliteTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

// ----------------------------------------------------------------------------
// ARTICLE — the home feed content. Markdown body rendered client-side.
// ----------------------------------------------------------------------------
export const articles = sqliteTable("articles", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  body: text("body").notNull().default(""),
  coverImage: text("cover_image"),
  tags: text("tags").notNull().default(""),
  readingMins: integer("reading_mins").notNull().default(1),
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  views: integer("views").notNull().default(0),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const articlesRelations = relations(articles, ({ one }) => ({
  author: one(users, { fields: [articles.authorId], references: [users.id] }),
}));

// ----------------------------------------------------------------------------
// FORUM — threads (top-level posts) + replies (nested under a thread).
// ----------------------------------------------------------------------------
export const forumThreads = sqliteTable("forum_threads", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  category: text("category").notNull().default("general"),
  pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
  locked: integer("locked", { mode: "boolean" }).notNull().default(false),
  views: integer("views").notNull().default(0),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const forumThreadsRelations = relations(forumThreads, ({ one, many }) => ({
  author: one(users, { fields: [forumThreads.authorId], references: [users.id] }),
  replies: many(forumReplies),
}));

export const forumReplies = sqliteTable("forum_replies", {
  id: text("id").primaryKey(),
  body: text("body").notNull(),
  threadId: text("thread_id")
    .notNull()
    .references(() => forumThreads.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const forumRepliesRelations = relations(forumReplies, ({ one }) => ({
  thread: one(forumThreads, { fields: [forumReplies.threadId], references: [forumThreads.id] }),
  author: one(users, { fields: [forumReplies.authorId], references: [users.id] }),
}));

// ----------------------------------------------------------------------------
// SHOP PRODUCT — placeholder model. Full commerce logic added later.
// ----------------------------------------------------------------------------
export const shopProducts = sqliteTable("shop_products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  price: integer("price").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  image: text("image"),
  status: text("status").notNull().default("DRAFT"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
