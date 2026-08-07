import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Testimonial, TestimonialDocument } from "./testimonial.schema";

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectModel(Testimonial.name)
    private readonly testimonials: Model<TestimonialDocument>,
  ) {}

  create(body: { name: string; review: string; rating: number }) {
    return this.testimonials.create(body);
  }

  findAll() {
    return this.testimonials.find().sort({ createdAt: -1 }).limit(6).lean();
  }
}
