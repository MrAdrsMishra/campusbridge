import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}
  async canActivate(context: ExecutionContext) {
    const auth = context.switchToHttp().getRequest().headers.authorization as
      | string
      | undefined;
    if (!auth?.startsWith("Bearer "))
      throw new UnauthorizedException("A counselor session is required.");
    try {
      context.switchToHttp().getRequest().user = await this.jwt.verifyAsync(
        auth.slice(7),
      );
      return true;
    } catch {
      throw new UnauthorizedException(
        "Your session is invalid or has expired.",
      );
    }
  }
}
