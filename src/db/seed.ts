import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL ?? "");
const db = drizzle(sql, { schema });

const now = new Date();
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

await db.insert(schema.users).values({
  id: "owner-1",
  email: "owner@nin.x",
  name: "NiN",
  role: "OWNER",
  passwordHash: null,
  banned: false,
  createdAt: now,
  updatedAt: now,
}).onConflictDoNothing();

await db.insert(schema.articles).values({
  id: "art-typescript-patterns",
  slug: "typescript-patterns-i-reach-for",
  title: "TypeScript patterns I reach for",
  excerpt: "A few TypeScript patterns that make my code safer and easier to read.",
  body: `# TypeScript patterns I reach for
A few patterns I keep coming back to.

## Discriminated unions
Discriminated unions are the single most powerful TypeScript feature for modeling state.

\`\`\`typescript
type Result<T> =
  | { status: "loading" }
  | { status: "success", data: T }
  | { status: "error", error: string };
\`\`\`

## The \`satisfies\` operator
\`satisfies\` lets you check a value matches a type *without* widening it.

## Branded types
Useful for preventing mix-ups between IDs.

Stay typed out there.`,
  tags: "typescript,patterns,intro",
  published: true,
  featured: false,
  readingMins: 4,
  views: 12,
  authorId: "owner-1",
  createdAt: now,
  updatedAt: now,
}).onConflictDoNothing();

await db.insert(schema.articles).values({
  id: "art-welcome",
  slug: "welcome-to-nin",
  title: "Welcome to NiN",
  excerpt: "A quick introduction to what this site is and what is coming next.",
  body: `# Welcome
This is the first article on **NiN**.

## What to expect
- Technical articles
- Open-source projects
- Community discussion

Stay tuned for more.`,
  tags: "welcome,intro",
  published: true,
  featured: true,
  readingMins: 1,
  views: 2,
  authorId: "owner-1",
  createdAt: oneHourAgo,
  updatedAt: oneHourAgo,
}).onConflictDoNothing();

await db.insert(schema.forumThreads).values({
  id: "thread-welcome",
  title: "Welcome to the forum",
  body: "This is the first thread. Feel free to discuss anything related to NiN.",
  category: "welcome",
  pinned: false,
  locked: false,
  views: 6,
  authorId: "owner-1",
  createdAt: now,
  updatedAt: now,
}).onConflictDoNothing();

await db.insert(schema.forumReplies).values({
  id: "reply-1",
  body: "This is a test reply to verify the last reply snippet feature works correctly.",
  threadId: "thread-welcome",
  authorId: "owner-1",
  createdAt: now,
  updatedAt: now,
}).onConflictDoNothing();

console.log("Seed complete: 1 user, 2 articles, 1 thread, 1 reply");
