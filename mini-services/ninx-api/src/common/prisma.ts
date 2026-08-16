// ============================================================================
// prisma.ts — singleton PrismaClient for the NestJS service.
// ----------------------------------------------------------------------------
// NestJS modules inject this service to talk to the database. We keep a single
// client instance per process to avoid exhausting DB connections during
// hot-reload in development.
//
// Docs:
//   - Prisma best practices (singleton): https://pris.ly/d/best-practices
//   - NestJS providers: https://docs.nestjs.com/providers
// ==========================================================================
import { PrismaClient } from "@prisma/client";
import { Injectable, type OnModuleInit } from "@nestjs/common";

// @Injectable marks this class as a provider that Nest's DI container can
// inject into controllers/services. Docs: https://docs.nestjs.com/providers
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // OnModuleInit is called once the Nest app has fully initialized this module.
  // We eagerly connect to avoid lazy-connect latency on the first request.
  // Docs: https://docs.nestjs.com/fundamentals/lifecycle-events
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
