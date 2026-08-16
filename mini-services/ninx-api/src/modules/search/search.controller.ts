// ============================================================================
// search.controller.ts — exposes the cross-entity search endpoint.
// ==========================================================================
import { Controller, Get, Query } from "@nestjs/common";
import { IsString, IsOptional } from "class-validator";
import { SearchService } from "./search.service";

// SearchQueryDto — typed query string for the search endpoint.
// Using a DTO (instead of @Query("q") string) is more robust under Bun's
// ESM runtime and gives us validation for free via the global ValidationPipe.
// The @IsString/@IsOptional decorators also whitelist the property so
// `forbidNonWhitelisted` doesn't reject it.
class SearchQueryDto {
  @IsString()
  @IsOptional()
  q?: string;
}

@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // GET /search?q=... — returns { articles, threads } matching the query.
  // NOTE: the method is named `query` (not `search`) to avoid a collision with
  // the injected `searchService`. When a constructor parameter property and a
  // prototype method share a name, the instance property shadows the method,
  // which breaks NestJS's `instance[methodName]()` dispatch with
  // "callback.apply is not a function".
  @Get()
  query(@Query() query: SearchQueryDto) {
    return this.searchService.search(query.q ?? "");
  }
}
