import { Controller, Get } from "@nestjs/common";

/**
 * Lightweight health endpoint for Render keep-alive checks.
 * Returns immediately without touching the database or external APIs.
 */
@Controller("health")
export class HealthController {
  @Get()
  check() {
    return { status: "ok" };
  }
}