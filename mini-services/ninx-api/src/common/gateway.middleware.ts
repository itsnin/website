// ============================================================================
// gateway.middleware.ts — strips the gateway's XTransformPort query param.
// ----------------------------------------------------------------------------
// The Caddy gateway uses ?XTransformPort=4000 to route requests to this
// service. Once the request arrives, that param is meaningless to our
// controllers and would trigger `forbidNonWhitelisted` validation errors.
// This middleware removes it from req.query before NestJS processes the DTO.
//
// Docs:
//   - NestJS Middleware: https://docs.nestjs.com/middleware
// ==========================================================================
import { Injectable, NestMiddleware } from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";

@Injectable()
export class GatewayMiddleware implements NestMiddleware {
  use(req: Request & { query: Record<string, unknown> }, _res: Response, next: NextFunction): void {
    // Delete the gateway routing param so DTO validation doesn't reject it.
    if (req.query && typeof req.query === "object") {
      delete req.query.XTransformPort;
      // Also handle the lowercase variant some clients send.
      delete req.query.xtransformport;
    }
    next();
  }
}
