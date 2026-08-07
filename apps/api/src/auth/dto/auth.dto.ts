import { IsEmail, IsIn, IsString, MinLength } from "class-validator";

export class LoginDto {
  @IsString()
  @MinLength(1)
  password!: string;
}

export class SetupCounselorDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsString()
  name!: string;

  @IsString()
  phone!: string;

  @IsString()
  setupKey!: string;

  @IsIn(["counselor", "admin"])
  role!: string;
}
