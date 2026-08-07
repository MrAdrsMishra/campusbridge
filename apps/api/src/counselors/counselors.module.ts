import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Counselor, CounselorSchema } from "./counselor.schema";
import { CounselorsController } from "./counselors.controller";
import { CounselorsService } from "./counselors.service";
import { AuthModule } from "../auth/auth.module";
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Counselor.name, schema: CounselorSchema },
    ]),
    AuthModule,
  ],
  controllers: [CounselorsController],
  providers: [CounselorsService],
  exports: [MongooseModule],
})
export class CounselorsModule {}
