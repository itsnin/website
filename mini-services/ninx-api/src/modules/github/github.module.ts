// ============================================================================
// github.module.ts — wires the GitHub feature.
// `exports` makes GithubService available to other modules that import this
// one (e.g., StatsModule needs it to count repos).
// Docs: https://docs.nestjs.com/modules#sharing-providers-between-modules
// ==========================================================================
import { Module } from "@nestjs/common";
import { GithubController } from "./github.controller";
import { GithubService } from "./github.service";

@Module({
  controllers: [GithubController],
  providers: [GithubService],
  exports: [GithubService],
})
export class GithubModule {}
