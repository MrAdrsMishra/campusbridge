import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type TestimonialDocument = HydratedDocument<Testimonial>;

@Schema({ timestamps: true })
export class Testimonial {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  review!: string;

  @Prop({ required: true, default: 5 })
  rating!: number;
}

export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);
