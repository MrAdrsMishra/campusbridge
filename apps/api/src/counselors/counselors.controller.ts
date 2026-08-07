import { Controller, Get, UseGuards } from "@nestjs/common";
import { CounselorsService } from "./counselors.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
@Controller("counselors")
export class CounselorsController {
  constructor(private readonly service: CounselorsService) {}
  @Get() @UseGuards(JwtAuthGuard) all() {
    return this.service.findAll();
  }
}
