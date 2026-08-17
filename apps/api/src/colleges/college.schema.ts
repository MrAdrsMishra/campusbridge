import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type CollegeDocument = HydratedDocument<College>;
@Schema({ timestamps: true })
export class College {
  @Prop({ required: true }) name!: string;
  @Prop({ required: true }) city!: string;
  @Prop() url?: string;
  @Prop() seriesId?: number;
  @Prop() shiksha_instituteId?: number;
}
export const CollegeSchema = SchemaFactory.createForClass(College);

