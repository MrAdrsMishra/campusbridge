import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import * as bcrypt from "bcrypt";
import { Model } from "mongoose";
import { Counselor, CounselorDocument } from "../counselors/counselor.schema";
import { LoginDto, SetupCounselorDto } from "./dto/auth.dto";
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Counselor.name)
    private readonly counselors: Model<CounselorDocument>,
    private readonly jwt: JwtService,
  ) {}
  async login(dto: LoginDto) {
    const secretKey = process.env.SECRET_KEY?.trim();
    if (!secretKey) {
      throw new UnauthorizedException("Admin secret is not configured.");
    }

    if (dto.password !== secretKey) {
      throw new UnauthorizedException("Invalid admin secret.");
    }

    return this.session({
      id: "admin",
      name: "Vishnu Mishra",
      email: "admin@nexteduwise.local",
      role: "admin",
    });
  }
  async setup(dto: SetupCounselorDto) {
    if (!process.env.SETUP_KEY || dto.setupKey !== process.env.SETUP_KEY)
      throw new UnauthorizedException("Invalid setup key.");
    const email = dto.email.toLowerCase();
    const existing = await this.counselors
      .findOne({ email })
      .select("+passwordHash");
    if (existing && existing.passwordHash !== "SET_PASSWORD_WITH_AUTH_SETUP")
      throw new ConflictException(
        "A counselor with this email already exists.",
      );
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const counselor = existing
      ? await this.counselors
          .findByIdAndUpdate(
            existing.id,
            { name: dto.name, phone: dto.phone, role: dto.role, passwordHash },
            { new: true },
          )
          .select("+passwordHash")
          .orFail()
      : await this.counselors.create({ ...dto, email, passwordHash });
    return this.session(counselor);
  }
  async me(id: string) {
    return this.counselors.findById(id).select("-passwordHash").lean();
  }
  private session(counselor: {
    id?: string;
    name: string;
    email: string;
    role: string;
  }) {
    const id = counselor.id ?? "admin";

    return {
      accessToken: this.jwt.sign({
        sub: id,
        email: counselor.email,
        role: counselor.role,
      }),
      counselor: {
        id,
        name: counselor.name,
        email: counselor.email,
        role: counselor.role,
      },
    };
  }
}
