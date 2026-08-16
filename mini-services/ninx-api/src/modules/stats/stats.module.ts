// ============================================================================
// stats.module.ts — wires the Stats feature.
// ==========================================================================
import { Module } from "@nestjs/common";
import { StatsController } from "./stats.controller";
import { StatsService } from "./stats.service";
import { PrismaService } from "@/common/prisma";
import { GithubModule } from "@/modules/github/github.module";

// Stats needs GithubService, so we import GithubModule to access its exports.
@Module({
  imports: [GithubModule],
  controllers: [StatsController],
  providers: [StatsService, PrismaService],
})
export class StatsModule {}
