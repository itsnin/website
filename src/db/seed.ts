// ============================================================================
// seed.ts — seeds the local SQLite database with test data.
// ----------------------------------------------------------------------------
// Run with: bun run src/db/seed.ts
// Creates: 1 owner user, 2 articles, 1 forum thread, 1 reply.
// ==========================================================================
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const client = createClient({ url: "file:/home/z/my-project/db/ninx.db" });
const db = drizzle(client, { schema });

// now — current timestamp as a Date for Drizzle's timestamp mode.
// Use slightly different timestamps for each entity so prev/next ordering works.
const now = new Date();
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

// Owner user.
await db.insert(schema.users).values({
  id: "owner-1",
  email: "owner@nin.x",
  name: "NiN.X",
  role: "OWNER",
  provider: "EMAIL",
  emailVerified: null,
  image: null,
  passwordHash: null,
  providerId: null,
  banned: false,
  createdAt: now,
  updatedAt: now,
}).onConflictDoNothing();

// Article 1: TypeScript patterns.
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

function handle<T>(r: Result<T>): string {
  switch (r.status) {
    case "loading":
      return "Loading…";
    case "success":
      return \`Got \${r.data}\`;
    case "error":
      return \`Failed: \${r.error}\`;
  }
}
\`\`\`

## The \`satisfies\` operator

\`satisfies\` lets you check a value matches a type *without* widening it.

\`\`\`typescript
const config = {
  port: 4000,
  host: "localhost",
} satisfies Record<string, string | number>;
\`\`\`

## Branded types

Useful for preventing mix-ups between IDs.

\`\`\`typescript
type UserId = string & { readonly __brand: "UserId" };
type ArticleId = string & { readonly __brand: "ArticleId" };
\`\`\`

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

// Article 2: Welcome.
await db.insert(schema.articles).values({
  id: "art-welcome",
  slug: "welcome-to-ninx",
  title: "Welcome to NiN.X",
  excerpt: "A quick introduction to what this site is and what is coming next.",
  body: `# Welcome

This is the first article on **NiN.X**.

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

// Forum thread.
await db.insert(schema.forumThreads).values({
  id: "thread-welcome",
  title: "Welcome to the forum",
  body: "This is the first thread. Feel free to discuss anything related to NiN.X.",
  category: "welcome",
  pinned: false,
  locked: false,
  views: 6,
  authorId: "owner-1",
  createdAt: now,
  updatedAt: now,
}).onConflictDoNothing();

// Forum reply.
await db.insert(schema.forumReplies).values({
  id: "reply-1",
  body: "This is a test reply to verify the last reply snippet feature works correctly.",
  threadId: "thread-welcome",
  authorId: "owner-1",
  createdAt: now,
  updatedAt: now,
}).onConflictDoNothing();

console.log("Seed complete: 1 user, 2 articles, 1 thread, 1 reply");
client.close();
