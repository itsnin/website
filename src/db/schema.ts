import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "timestamp_ms" }),
  image: text("image"),
  passwordHash: text("password_hash"),
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

// account + session + verificationtoken — required by auth.js (nextauth)
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
