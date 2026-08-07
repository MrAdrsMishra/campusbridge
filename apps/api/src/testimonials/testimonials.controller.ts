import { Body, Controller, Get, Post } from "@nestjs/common";
import { TestimonialsService } from "./testimonials.service";

@Controller("testimonials")
export class TestimonialsController {
  constructor(private readonly service: TestimonialsService) {}

  @Post()
  create(@Body() body: { name: string; review: string; rating: number }) {
    return this.service.create(body);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
