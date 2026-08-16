import { Controller, Get, Query } from "@nestjs/common";
import { IsString, IsOptional } from "class-validator";
import { SearchService } from "./search.service";

class SearchQueryDto {
  @IsString()
  @IsOptional()
  q?: string;
}

@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  query(@Query() query: SearchQueryDto) {
    return this.searchService.search(query.q ?? "");
  }
}
