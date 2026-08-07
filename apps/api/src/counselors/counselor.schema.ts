import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CounselorDocument = HydratedDocument<Counselor>;

@Schema({ timestamps: true })
export class Counselor {
  @Prop({ required: true, trim: true }) name!: string;
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;
  @Prop({ required: true }) phone!: string;
  @Prop({ required: true, select: false }) passwordHash!: string;
  @Prop({ enum: ["counselor", "admin"], default: "counselor" }) role!: string;
  @Prop({ default: true }) active!: boolean;
  @Prop({ type: [String], default: [] }) specializations!: string[];
}
export const CounselorSchema = SchemaFactory.createForClass(Counselor);
