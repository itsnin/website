// ============================================================================
// validations.ts — Zod schemas for all API request validation.
// ----------------------------------------------------------------------------
// Every Route Handler validates its input against these schemas before
// processing. Zod provides runtime validation + TypeScript type inference
// from a single source of truth.
//
// Docs: https://zod.dev/
// ==========================================================================
import { z } from "zod";

// ----------------------------------------------------------------------------
// Pagination — every list endpoint accepts these query params.
// ----------------------------------------------------------------------------
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).default(20),
});

// ----------------------------------------------------------------------------
// Article DTOs
// ----------------------------------------------------------------------------
export const createArticleSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  body: z.string().optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  tags: z.string().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
});

// ----------------------------------------------------------------------------
// Forum DTOs
// ----------------------------------------------------------------------------
export const createThreadSchema = z.object({
  title: z.string().min(1),
  body: z.string().optional(),
  category: z.string().optional(),
});

export const createReplySchema = z.object({
  body: z.string().min(1),
});

// ----------------------------------------------------------------------------
// Forum list query — pagination + optional category filter + sort.
// ----------------------------------------------------------------------------
export const forumListQuerySchema = paginationSchema.extend({
  category: z.string().optional(),
  sort: z.enum(["newest", "oldest", "views", "replies"]).optional().default("newest"),
});

// ----------------------------------------------------------------------------
// Auth DTOs
// ----------------------------------------------------------------------------
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
