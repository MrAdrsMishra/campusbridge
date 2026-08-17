import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { LeadsService } from "./leads.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
@Controller("leads")
export class LeadsController {
  constructor(private readonly service: LeadsService) {}
  @Post() create(@Body() dto: CreateLeadDto) {
    return this.service.create(dto);
  }
  @Get() @UseGuards(JwtAuthGuard) all() {
    return this.service.findAll();
  }
  @Patch(":id") @UseGuards(JwtAuthGuard) update(
    @Param("id") id: string,
    @Body() dto: Partial<CreateLeadDto>,
  ) {
    return this.service.update(id, dto);
  }
  @Get("export/csv")
  @UseGuards(JwtAuthGuard)
  @Header("Content-Type", "text/csv")
  @Header("Content-Disposition", "attachment; filename=student-leads.csv")
  csv() {
    return this.service.exportCsv();
  }

  @Get("contact-info")
  contactInfo() {
    return {
      phone: process.env.COUNSELOR_CONTACT_PHONE ?? "+919039220551",
      email: process.env.COUNSELOR_CONTACT_EMAIL ?? "nexteduwiseconsultancy@gmail.com",
    };
  }
}
