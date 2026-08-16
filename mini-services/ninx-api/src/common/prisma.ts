import { PrismaClient } from "@prisma/client";
import { Injectable, type OnModuleInit } from "@nestjs/common";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // we eagerly connect to avoid lazy-connect latency on the first request
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
