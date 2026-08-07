import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Lead, LeadSchema } from "./lead.schema";
import { LeadsController } from "./leads.controller";
import { LeadsService } from "./leads.service";
import { AuthModule } from "../auth/auth.module";
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lead.name, schema: LeadSchema }]),
    AuthModule,
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
