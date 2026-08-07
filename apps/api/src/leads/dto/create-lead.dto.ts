import { IsEmail, IsIn, IsMongoId, IsOptional, IsString } from "class-validator";

export class CreateLeadDto {
  @IsString()
  name!: string;

  @IsString()
  phone!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  course!: string;

  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  budget?: string;

  @IsOptional()
  @IsIn(["new", "contacted", "follow-up", "interested", "documents", "meeting", "admitted"])
  status?: string;

  @IsOptional()
  @IsString()
  counselor?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsMongoId()
  counselorId?: string;

  @IsOptional()
  @IsIn(["pending", "yes", "no"])
  contacted?: string;

  @IsOptional()
  @IsIn(["pending", "ready", "unclear"])
  interest?: string;

  @IsOptional()
  @IsString()
  response?: string;

  @IsOptional()
  @IsString()
  searchActivity?: string;
}
