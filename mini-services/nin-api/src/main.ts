import "reflect-metadata"; // Required by NestJS for decorator metadata.
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix("api");

  const port = 4000;
  await app.listen(port);
  Logger.log(`NiN API listening on http://localhost:${port}`, "Bootstrap");
}

bootstrap().catch((err) => {
  // if bootstrap fails, log + exit non-zero so the process manager restarts us
  console.error("Failed to bootstrap NiN API:", err);
  process.exit(1);
});
