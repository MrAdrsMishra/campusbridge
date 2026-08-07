import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Lead, LeadDocument } from "./lead.schema";
import { CreateLeadDto } from "./dto/create-lead.dto";
@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead.name) private readonly leads: Model<LeadDocument>,
  ) {}
  create(dto: CreateLeadDto) {
    return this.leads.create(dto);
  }
  findAll() {
    return this.leads.find().sort({ createdAt: -1 }).lean();
  }
  update(id: string, dto: Partial<CreateLeadDto>) {
    return this.leads.findByIdAndUpdate(id, dto, { new: true }).lean();
  }
  async exportCsv() {
    const records = await this.findAll();
    const header = [
      "Name",
      "Phone",
      "Email",
      "Course",
      "City",
      "Budget",
      "Status",
      "Contacted",
      "Interest",
      "Counselor",
      "Notes",
      "Response",
      "Search Activity",
      "Created",
    ];
    const escape = (value: unknown) =>
      `"${String(value ?? "").replaceAll('"', '""')}"`;
    return [
      header.join(","),
      ...records.map((x) =>
        [
          x.name,
          x.phone,
          x.email,
          x.course,
          x.city,
          x.budget,
          x.status,
          x.contacted,
          x.interest,
          x.counselor,
          x.notes,
          x.response,
          x.searchActivity,
          (x as unknown as { createdAt: Date }).createdAt,
        ]
          .map(escape)
          .join(","),
      ),
    ].join("\n");
  }
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async removeExpired() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    await this.leads.deleteMany({ createdAt: { $lt: cutoff } });
  }
}
