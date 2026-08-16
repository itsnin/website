import { Body, Controller, Get, Param, Post, Patch, Delete, Query, UseGuards, Req } from "@nestjs/common";
import { ArticlesService } from "./articles.service";
import { CreateArticleDto, UpdateArticleDto, PaginationDto, IdParamDto } from "@/common/dto";
import { AuthGuard, type PublicUser } from "@/common/auth-context";

@Controller("articles")
export class ArticlesController {
  constructor(private readonly articles: ArticlesService) {}

  @Get()
  list(@Query() pagination: PaginationDto) {
    return this.articles.listPublic(pagination);
  }

  @Get("popular")
  listPopular() {
    return this.articles.listPopular(3);
  }

  @Get("tags")
  listTags() {
    return this.articles.listTags();
  }

  @Get("by-tag/:tag")
  listByTag(@Param("tag") tag: string, @Query() pagination: PaginationDto) {
    return this.articles.listByTag(tag, pagination);
  }

  @Get(":slug")
  getBySlug(@Param("slug") slug: string) {
    return this.articles.getBySlug(slug);
  }

  @Get(":slug/related")
  getRelated(@Param("slug") slug: string) {
    return this.articles.listRelated(slug);
  }

  @Get(":slug/neighbors")
  getNeighbors(@Param("slug") slug: string) {
    return this.articles.getNeighbors(slug);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@Req() req: { user?: PublicUser }, @Body() dto: CreateArticleDto) {
    return this.articles.create(req.user!.id, dto);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  update(@Param() { id }: IdParamDto, @Body() dto: UpdateArticleDto) {
    return this.articles.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  remove(@Param() { id }: IdParamDto) {
    return this.articles.remove(id);
  }
}
