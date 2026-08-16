// ============================================================================
// articles.module.ts — wires the Articles feature together.
// ----------------------------------------------------------------------------
// A NestJS Module declares the components Nest should manage for a feature.
// Each feature is self-contained: its own controller + service + DTOs.
//
// Docs: https://docs.nestjs.com/modules
// ==========================================================================
import { Module } from "@nestjs/common";
import { ArticlesController } from "./articles.controller";
import { ArticlesService } from "./articles.service";
import { PrismaService } from "@/common/prisma";

@Module({
  // controllers — routes registered for this feature.
  controllers: [ArticlesController],
  // providers — services this module needs and exposes.
  providers: [ArticlesService, PrismaService],
})
export class ArticlesModule {}
