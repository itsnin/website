import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/common/prisma";

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  async listVisible() {
    return this.prisma.shopProduct.findMany({
      where: { status: { in: ["COMING_SOON", "AVAILABLE"] } },
      orderBy: { createdAt: "asc" },
    });
  }

  async getBySlug(slug: string) {
    return this.prisma.shopProduct.findUnique({ where: { slug } });
  }
}
