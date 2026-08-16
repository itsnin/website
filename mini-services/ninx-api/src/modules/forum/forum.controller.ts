// ============================================================================
// forum.controller.ts — HTTP handlers for /forum routes.
// ----------------------------------------------------------------------------
// Routes:
//   GET    /forum/threads          (public)  list threads
//   GET    /forum/categories       (public)  list categories
//   GET    /forum/threads/:id      (public)  thread + paginated replies
//   POST   /forum/threads          (auth)    create thread
//   POST   /forum/threads/:id/replies (auth) create reply
//
// Docs: https://docs.nestjs.com/controllers
// ==========================================================================
import { Body, Controller, Get, Param, Post, Query, UseGuards, Req } from "@nestjs/common";
import { IsString, IsOptional, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";
import { ForumService } from "./forum.service";
import { CreateThreadDto, CreateReplyDto, IdParamDto } from "@/common/dto";
import { AuthGuard, type PublicUser } from "@/common/auth-context";

// ForumListQueryDto — pagination + optional category filter + sort for thread listing.
// We flatten PaginationDto's fields directly (instead of extending) because
// decorator inheritance can be unreliable under some TS/Bun configurations.
// The global ValidationPipe with `forbidNonWhitelisted` rejects unknown query
// params, so every allowed param must be explicitly declared here.
class ForumListQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  pageSize?: number = 20;

  @IsString()
  @IsOptional()
  category?: string;

  // sort — one of "newest", "oldest", "views", "replies". Defaults to "newest".
  @IsString()
  @IsOptional()
  sort?: string;
}

@Controller("forum")
export class ForumController {
  constructor(private readonly forum: ForumService) {}

  // GET /forum/threads — public list with pagination + optional category filter + sort.
  @Get("threads")
  listThreads(@Query() query: ForumListQueryDto) {
    // Only pass the category if it's a non-empty string.
    const cat = query.category && query.category.trim().length > 0 ? query.category.trim() : undefined;
    // Validate + normalize the sort param. Fall back to "newest" for invalid values.
    const validSorts = ["newest", "oldest", "views", "replies"];
    const sort = query.sort && validSorts.includes(query.sort) ? (query.sort as "newest" | "oldest" | "views" | "replies") : "newest";
    return this.forum.listThreads(query, cat, sort);
  }

  // GET /forum/categories — public list of categories with counts.
  @Get("categories")
  listCategories() {
    return this.forum.listCategories();
  }

  // GET /forum/threads/:id — public thread detail + paginated replies.
  // We keep the pagination separate so a thread with 1000 replies stays cheap.
  @Get("threads/:id")
  getThread(@Param() { id }: IdParamDto, @Query() pagination: PaginationDto) {
    return this.forum.getThread(id, pagination);
  }

  // POST /forum/threads — create a new thread. AUTH REQUIRED.
  // AuthGuard throws 401 if no user header, preventing anonymous posts.
  @Post("threads")
  @UseGuards(AuthGuard)
  createThread(@Req() req: { user?: PublicUser }, @Body() dto: CreateThreadDto) {
    return this.forum.createThread(req.user!.id, dto);
  }

  // POST /forum/threads/:id/replies — create a reply. AUTH REQUIRED.
  @Post("threads/:id/replies")
  @UseGuards(AuthGuard)
  createReply(
    @Req() req: { user?: PublicUser },
    @Param() { id }: IdParamDto,
    @Body() dto: CreateReplyDto,
  ) {
    return this.forum.createReply(req.user!.id, id, dto);
  }
}
