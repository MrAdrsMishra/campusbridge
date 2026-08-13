// src/colleges/colleges.controller.ts
import { Controller, Get, NotFoundException, Query } from "@nestjs/common";
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

  // Step 1 — Shiksha auto-suggest: returns { name, url } of the relevant category.
  @Get("search")
  search(@Query() query: ShikshaSearchQueryDto) {
    return this.service.searchShiksha(query.query);
  }

  // Step 2 — Resolve a Shiksha category page into a clean College360-backed list.
  @Get()
  all(@Query() query: ShikshaCollegeListQueryDto) {
    return this.service.getCollegesFromShiksha(query.url);
  }

  // Kept for backward compatibility — the web app still uses this College360 flow.
  // Priority inside the service: name if provided, else city. Course narrows the results further.
  @Get("suggestions")
  suggestions(@Query() query: CollegeSearchQueryDto) {
    return this.service.suggest(query);
  }

  // Step 3 — Selected-college detail (slug + seriesId from the list above).
  @Get("details")
  async details(@Query() query: CollegeScrapeQueryDto) {
    const result = await this.service.getCollegeDetailView(query.slug, query.seriesId);
    if (!result) throw new NotFoundException("College not found");
    return result;
  }
}