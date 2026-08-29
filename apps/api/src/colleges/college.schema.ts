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
  @Prop() collegeType?: string;
  @Prop({ type: [String], default: [] }) facilities?: string[];
  @Prop() averageFees?: number;
  @Prop() aggregateRating?: number;
}
export const CollegeSchema = SchemaFactory.createForClass(College);

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true, index: true }) keyword!: string;
  @Prop({ required: true }) name!: string;
  @Prop({ required: true }) url!: string;
  @Prop({ required: true, index: true }) slug!: string;
  @Prop({ type: [String], default: [] }) aliases!: string[];
}
export const CategorySchema = SchemaFactory.createForClass(Category);
