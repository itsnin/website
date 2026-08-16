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
  providers: [PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GatewayMiddleware).forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
