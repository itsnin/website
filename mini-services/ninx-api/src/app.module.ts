// ============================================================================
// app.module.ts — root module aggregating every feature module.
// ----------------------------------------------------------------------------
// NestJS apps compose features by importing their modules here. This is the
// single source of truth for "what's installed" in the API.
//
// Docs: https://docs.nestjs.com/modules
// ==========================================================================
import { Module, MiddlewareConsumer, RequestMethod } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ArticlesModule } from "./modules/articles/articles.module";
import { ForumModule } from "./modules/forum/forum.module";
import { ShopModule } from "./modules/shop/shop.module";
import { GithubModule } from "./modules/github/github.module";
import { SearchModule } from "./modules/search/search.module";
import { AuthModule } from "./modules/auth/auth.module";
import { StatsModule } from "./modules/stats/stats.module";
import { PrismaService } from "./common/prisma";
import { GatewayMiddleware } from "./common/gateway.middleware";

@Module({
  // ConfigModule loads .env into process.env. `isGlobal` makes ConfigService
  // injectable everywhere without re-importing.
  // Docs: https://docs.nestjs.com/techniques/configuration
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ArticlesModule,
    ForumModule,
    ShopModule,
    GithubModule,
    SearchModule,
    AuthModule,
    StatsModule,
  ],
  // PrismaService at root so every feature module shares the same instance.
  providers: [PrismaService],
})
export class AppModule {
  // configure — registers middleware globally before all controller routes.
  // Docs: https://docs.nestjs.com/middleware#applying-middleware
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GatewayMiddleware).forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
