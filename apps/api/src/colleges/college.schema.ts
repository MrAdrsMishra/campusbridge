import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type CollegeDocument = HydratedDocument<College>;
@Schema({ timestamps: true })
export class College {
  @Prop({ required: true }) name!: string;
  @Prop({ required: true }) city!: string;
  @Prop({ required: true }) state!: string;
  @Prop({ required: true }) about!: string;
  @Prop({ type: [String], required: true }) courses!: string[];
  @Prop({ type: [{ name: String, rating: Number, comment: String }], default: [] }) reviews!: { name: string; rating: number; comment: string }[];
  @Prop() image?: string;
  @Prop() averageFees?: number;
}
export const CollegeSchema = SchemaFactory.createForClass(College);
