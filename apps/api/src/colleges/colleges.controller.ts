// src/colleges/colleges.controller.ts
import { BadRequestException, Controller, Get, NotFoundException, Query } from "@nestjs/common";
import { CollegesService } from "./colleges.service";
import {
  CollegeScrapeQueryDto,
  CollegeSearchQueryDto,
  ShikshaCollegeListQueryDto,
  ShikshaSearchQueryDto,
} from "./college.dto";


@Controller("colleges")
export class CollegesController {
  constructor(private readonly service: CollegesService) {}

  // Step 1 — Shiksha search, two modes:
  //   - college name  → returns the final CollegeListItem[] (all `institute` hits resolved).
  //   - course/category → returns the single { name, url } category for Step 2.
  @Get("search")
  search(@Query() query: ShikshaSearchQueryDto) {
    return this.service.searchShiksha(query.query, query.city);
  }

  // Step 2 — Resolve a Shiksha category page into a clean College360-backed list.
  @Get()
  all(@Query() query: ShikshaCollegeListQueryDto) {
    return this.service.getCollegesFromShiksha(query.url, query.city);
  }

  // Kept for backward compatibility — the web app still uses this College360 flow.
  // Priority inside the service: name if provided, else city. Course narrows the results further.
  @Get("suggestions")
  suggestions(@Query() query: CollegeSearchQueryDto) {
    return this.service.suggest(query);
  }

  // Canonical resolution endpoint: Returns matched College360 { url, seriesId } using city & Fuse.js DB strategy.
  @Get("canonical")
  canonical(@Query() query: CollegeScrapeQueryDto) {
    if (!query.name?.trim() || !query.city?.trim()) {
      throw new BadRequestException("Both college name and city are required.");
    }
    return this.service.resolveCanonicalCollege(
      query.name,
      query.city,
      query.shikshaInstituteId,
    );
  }

  // Step 3 — Selected-college detail.
  // When a `name` and `city` are supplied, it uses the city-based Fuse.js & DB lookup strategy
  // to resolve the canonical College360 url (slug + seriesId), then loads full details.
  // With slug + seriesId provided, it loads them directly.
  @Get("details")
  async details(@Query() query: CollegeScrapeQueryDto) {
    let slug = query.slug;
    let seriesId = query.seriesId;

    if (query.name?.trim()) {
      if (query.city?.trim()) {
        const resolved = await this.service.resolveCanonicalCollege(
          query.name,
          query.city,
          query.shikshaInstituteId,
        );
        slug = resolved.slug;
        seriesId = resolved.seriesId;
      } else {
        return this.service.getCollegeDetailsByName(query.name);
      }
    }

    if (!slug || !seriesId) {
      throw new BadRequestException(
        "Provide either a college name, or a slug and seriesId.",
      );
    }
    const result = await this.service.getCollegeDetailView(slug, seriesId);
    if (!result) throw new NotFoundException("Not able to load");
    return result;
  }
}