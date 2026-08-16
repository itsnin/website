// ============================================================================
// articles.controller.ts — HTTP handlers for /articles routes.
// ----------------------------------------------------------------------------
// Controllers translate HTTP ↔ service calls. They contain NO business logic.
// Validation is done globally by ValidationPipe based on DTO decorators.
//
// Docs:
//   - NestJS Controllers: https://docs.nestjs.com/controllers
//   - NestJS Routing: https://docs.nestjs.com/controllers#routing
// ==========================================================================
import { Body, Controller, Get, Param, Post, Patch, Delete, Query, UseGuards, Req } from "@nestjs/common";
import { ArticlesService } from "./articles.service";
import { CreateArticleDto, UpdateArticleDto, PaginationDto, IdParamDto } from "@/common/dto";
import { AuthGuard, type PublicUser } from "@/common/auth-context";

@Controller("articles")
export class ArticlesController {
  // Inject the service — Nest resolves the singleton via DI.
  constructor(private readonly articles: ArticlesService) {}

  // GET /articles — public list. No auth required.
  @Get()
  list(@Query() pagination: PaginationDto) {
    return this.articles.listPublic(pagination);
  }

  // GET /articles/popular — public list of most-viewed articles.
  // Placed BEFORE :slug so NestJS doesn't match "popular" as a slug.
  @Get("popular")
  listPopular() {
    return this.articles.listPopular(3);
  }

  // GET /articles/tags — public list of all tags with counts.
  // Placed BEFORE :slug so NestJS doesn't match "tags" as a slug.
  @Get("tags")
  listTags() {
    return this.articles.listTags();
  }

  // GET /articles/by-tag/:tag — public list of articles for a given tag.
  @Get("by-tag/:tag")
  listByTag(@Param("tag") tag: string, @Query() pagination: PaginationDto) {
    return this.articles.listByTag(tag, pagination);
  }

  // GET /articles/:slug — public single article.
  @Get(":slug")
  getBySlug(@Param("slug") slug: string) {
    return this.articles.getBySlug(slug);
  }

  // GET /articles/:slug/related — public list of related articles by tag.
  // Placed AFTER the :slug GET but BEFORE :id routes so NestJS matches the
  // longer path first. Route order matters in NestJS.
  // Docs: https://docs.nestjs.com/controllers#routing
  @Get(":slug/related")
  getRelated(@Param("slug") slug: string) {
    return this.articles.listRelated(slug);
  }

  // GET /articles/:slug/neighbors — public prev/next articles for navigation.
  @Get(":slug/neighbors")
  getNeighbors(@Param("slug") slug: string) {
    return this.articles.getNeighbors(slug);
  }

  // POST /articles — owner-only create. AuthGuard enforces a user header.
  // @UseGuards attaches the guard to this specific handler.
  // Docs: https://docs.nestjs.com/guards
  @Post()
  @UseGuards(AuthGuard)
  create(@Req() req: { user?: PublicUser }, @Body() dto: CreateArticleDto) {
    // req.user is populated by AuthGuard; non-null asserted because the guard
    // already rejected unauthenticated requests.
    return this.articles.create(req.user!.id, dto);
  }

  // PATCH /articles/:id — partial update (owner-only).
  @Patch(":id")
  @UseGuards(AuthGuard)
  update(@Param() { id }: IdParamDto, @Body() dto: UpdateArticleDto) {
    return this.articles.update(id, dto);
  }

  // DELETE /articles/:id — hard delete (owner-only).
  @Delete(":id")
  @UseGuards(AuthGuard)
  remove(@Param() { id }: IdParamDto) {
    return this.articles.remove(id);
  }
}
