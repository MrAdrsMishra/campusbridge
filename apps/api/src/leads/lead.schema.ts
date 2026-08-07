import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
export type LeadDocument = HydratedDocument<Lead>;
@Schema({ timestamps: true })
export class Lead {
  @Prop({ required: true, trim: true }) name!: string;
  @Prop({ required: true }) phone!: string;
  @Prop() email?: string;
  @Prop({ required: true }) course!: string;
  @Prop({ required: true }) city!: string;
  @Prop() budget?: string;
  @Prop({ enum: ['new', 'contacted', 'follow-up', 'interested', 'documents', 'meeting', 'admitted'], default: 'new' }) status!: string;
  @Prop() counselor?: string;
  @Prop({ type: Types.ObjectId, ref: 'Counselor' }) counselorId?: Types.ObjectId;
  @Prop() notes?: string;
  @Prop({ enum: ['pending', 'yes', 'no'], default: 'pending' }) contacted!: string;
  @Prop({ enum: ['pending', 'ready', 'unclear'], default: 'pending' }) interest!: string;
  @Prop() response?: string;
  @Prop() searchActivity?: string;
}
export const LeadSchema = SchemaFactory.createForClass(Lead);
