import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, SetupCounselorDto } from "./dto/auth.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
@Controller("auth")
export class AuthController {
  constructor(private readonly service: AuthService) {}
  @Post("login") login(@Body() dto: LoginDto) {
    return this.service.login(dto);
  }
  @Post("setup") setup(@Body() dto: SetupCounselorDto) {
    return this.service.setup(dto);
  }
  @Get("me") @UseGuards(JwtAuthGuard) me(
    @Req() req: { user: { sub: string } },
  ) {
    return this.service.me(req.user.sub);
  }
}
