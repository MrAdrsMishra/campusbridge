import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import { HealthModule } from "./health/health.module";
import { CollegesModule } from "./colleges/colleges.module";
import { LeadsModule } from "./leads/leads.module";
import { CounselorsModule } from "./counselors/counselors.module";
import { AuthModule } from "./auth/auth.module";
import { TestimonialsModule } from "./testimonials/testimonials.module";

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI ?? "mongodb://localhost:27017/nexteduwise",
    ),
    ScheduleModule.forRoot(),
    HealthModule,
    CollegesModule,
    CounselorsModule,
    AuthModule,
    LeadsModule,
    TestimonialsModule,
  ],
})
export class AppModule {}
