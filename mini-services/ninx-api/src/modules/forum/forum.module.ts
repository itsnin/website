// ============================================================================
// forum.module.ts — wires the Forum feature.
// Docs: https://docs.nestjs.com/modules
// ==========================================================================
import { Module } from "@nestjs/common";
import { ForumController } from "./forum.controller";
import { ForumService } from "./forum.service";
import { PrismaService } from "@/common/prisma";

@Module({
  controllers: [ForumController],
  providers: [ForumService, PrismaService],
})
export class ForumModule {}
