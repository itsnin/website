import { Body, Controller, Get, Param, Post, Query, UseGuards, Req } from "@nestjs/common";
import { IsString, IsOptional, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";
import { ForumService } from "./forum.service";
import { CreateThreadDto, CreateReplyDto, IdParamDto } from "@/common/dto";
import { AuthGuard, type PublicUser } from "@/common/auth-context";

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

  @IsString()
  @IsOptional()
  sort?: string;
}

@Controller("forum")
export class ForumController {
  constructor(private readonly forum: ForumService) {}

  @Get("threads")
  listThreads(@Query() query: ForumListQueryDto) {
    const cat = query.category && query.category.trim().length > 0 ? query.category.trim() : undefined;
    const validSorts = ["newest", "oldest", "views", "replies"];
    const sort = query.sort && validSorts.includes(query.sort) ? (query.sort as "newest" | "oldest" | "views" | "replies") : "newest";
    return this.forum.listThreads(query, cat, sort);
  }

  @Get("categories")
  listCategories() {
    return this.forum.listCategories();
  }

  @Get("threads/:id")
  getThread(@Param() { id }: IdParamDto, @Query() pagination: PaginationDto) {
    return this.forum.getThread(id, pagination);
  }

  // authguard throws 401 if no user header, preventing anonymous posts
  @Post("threads")
  @UseGuards(AuthGuard)
  createThread(@Req() req: { user?: PublicUser }, @Body() dto: CreateThreadDto) {
    return this.forum.createThread(req.user!.id, dto);
  }

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
