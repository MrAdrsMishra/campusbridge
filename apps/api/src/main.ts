import "./env";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { join } from "path";
import type { Request, Response, NextFunction } from "express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // In production the built SPA lives at <project>/apps/web/dist.
  // __dirname = <project>/apps/api/dist, so we must go up TWO levels
  // (apps/api/dist -> apps/api -> apps) to reach the repo root's apps/web/dist.
  const staticDir = join(__dirname, "..", "..", "web", "dist");
  app.useStaticAssets(staticDir, { index: false });

  // SPA fallback — serve index.html for any unmatched GET that isn't an API route.
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (
      req.method === "GET" &&
      !req.path.startsWith("/colleges") &&
      !req.path.startsWith("/testimonials") &&
      !req.path.startsWith("/leads") &&
      !req.path.startsWith("/counselors") &&
      !req.path.startsWith("/auth")
    ) {
      res.sendFile(join(staticDir, "index.html"));
    } else {
      next();
    }
  });

  app.enableCors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:5173" });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
