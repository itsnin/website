// ============================================================================
// search.module.ts — wires the Search feature.
// ==========================================================================
import { Module } from "@nestjs/common";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";
import { PrismaService } from "@/common/prisma";

@Module({
  controllers: [SearchController],
  providers: [SearchService, PrismaService],
})
export class SearchModule {}
