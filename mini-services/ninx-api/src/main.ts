// ============================================================================
// main.ts — NestJS application entry point.
// ----------------------------------------------------------------------------
// Responsibilities:
//   - Bootstrap the Nest app on port 4000.
//   - Enable CORS so the Next.js frontend (port 3000, served via the gateway)
//     can call us. In production behind the gateway, same-origin requests go
//     through Caddy with XTransformPort, but CORS is still needed for direct
//     dev calls.
//   - Register a global ValidationPipe so every DTO is auto-validated.
//   - Strip null/undefined fields and forbid non-whitelisted props to keep
//     the API contract strict (enterprise-grade hygiene).
//
// Docs:
//   - NestJS bootstrap: https://docs.nestjs.com/first-steps
//   - ValidationPipe: https://docs.nestjs.com/techniques/validation
//   - CORS: https://docs.nestjs.com/security/cors
// ==========================================================================
import "reflect-metadata"; // Required by NestJS for decorator metadata.
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  // Create the Nest application root. Bun runs TS natively, so no compile step.
  const app = await NestFactory.create(AppModule, { cors: true });

  // Global ValidationPipe — runs before every controller handler.
  // `whitelist` drops unknown fields; `forbidNonWhitelisted` 400s on them.
  // `transform` coerces query params to their declared DTO types.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global API prefix — every route is under /api so it's easy to distinguish
  // API traffic from any future static assets.
  app.setGlobalPrefix("api");

  // Listen on port 4000. The Next.js frontend reaches us via the gateway at
  // /api/...?XTransformPort=4000.
  const port = 4000;
  await app.listen(port);
  Logger.log(`NiN.X API listening on http://localhost:${port}`, "Bootstrap");
}

// Top-level await is supported in ES2022 modules (Bun enables this).
// Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await
bootstrap().catch((err) => {
  // If bootstrap fails, log + exit non-zero so the process manager restarts us.
  console.error("Failed to bootstrap NiN.X API:", err);
  process.exit(1);
});
