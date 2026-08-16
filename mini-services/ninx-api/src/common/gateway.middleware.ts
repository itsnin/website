import { Injectable, NestMiddleware } from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";

@Injectable()
export class GatewayMiddleware implements NestMiddleware {
  use(req: Request & { query: Record<string, unknown> }, _res: Response, next: NextFunction): void {
    // delete the gateway routing param so dto validation doesn't reject it
    if (req.query && typeof req.query === "object") {
      delete req.query.XTransformPort;
      delete req.query.xtransformport;
    }
    next();
  }
}
