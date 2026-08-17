import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Testimonial, TestimonialDocument } from "./testimonial.schema";

/**
 * Fallback reviews used ONLY when the connected DB's `testimonials` collection is
 * empty. If your real reviews live in a different database/collection, point
 * MONGODB_URI at it instead of relying on this seed.
 */
const SEED_TESTIMONIALS = [
  { name: "Ananya Sharma", review: "Found my dream B.Tech college within minutes. The counselor follow-up made the whole admission process stress-free.", rating: 5 },
  { name: "Rohan Verma", review: "Compared fees and cutoffs across multiple colleges easily. nexteduwise saved me a lot of time and confusion.", rating: 5 },
  { name: "Priya Nair", review: "The location-based recommendations were spot on. I chose a college close to home and got great guidance.", rating: 4 },
  { name: "Aarav Patel", review: "Clear course info, honest reviews and quick help from real experts. Highly recommended for any student.", rating: 5 },
  { name: "Sneha Reddy", review: "Loved how the process narrowed options by my preferred city. Admission tracking kept everything organised.", rating: 4 },
  { name: "Kabir Singh", review: "From shortlisting to counselling, everything was handled smoothly. Grateful for the support!", rating: 5 },
];

const CACHE_TTL_MS = 5 * 60 * 1_000; // 5 minutes

@Injectable()
export class TestimonialsService implements OnModuleInit {
  private readonly logger = new Logger(TestimonialsService.name);

  private cache: TestimonialDocument[] | null = null;
  private cacheExpiresAt = 0;

  constructor(
    @InjectModel(Testimonial.name)
    private readonly testimonials: Model<TestimonialDocument>,
  ) {}

  async onModuleInit() {
    const count = await this.testimonials.estimatedDocumentCount();
    if (count > 0) return;
    await this.testimonials.insertMany(SEED_TESTIMONIALS);
    this.logger.log(
      `Seeded ${SEED_TESTIMONIALS.length} default testimonials (collection was empty).`,
    );
  }

  async create(body: { name: string; review: string; rating: number }) {
    const doc = await this.testimonials.create(body);
    // Prepend to cache so the next GET is still instant.
    if (this.cache) {
      this.cache = [doc, ...this.cache].slice(0, 6);
      this.cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    }
    return doc;
  }

  async findAll(): Promise<TestimonialDocument[]> {
    if (this.cache && Date.now() < this.cacheExpiresAt) {
      return this.cache;
    }
    const docs = await this.testimonials.find().sort({ createdAt: -1 }).limit(6).lean() as unknown as TestimonialDocument[];
    this.cache = docs;
    this.cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    return docs;
  }
}

