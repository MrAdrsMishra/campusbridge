// src/colleges/colleges.controller.ts
import {
  BadRequestException,
  Controller,
  Get,
  Header,
  NotFoundException,
  Query,
  StreamableFile,
} from "@nestjs/common";
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
    return this.service.searchShiksha(query.query, query.city, query.state);
  }

  // Step 2 — Resolve a Shiksha category page into a clean College360-backed list.
  @Get()
  all(@Query() query: ShikshaCollegeListQueryDto) {
    return this.service.getCollegesFromShiksha(
      query.url,
      query.city,
      query.state,
    );
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

  // Image hotlink-proxy. Shiksha serves its campus photos/logos from an S3 bucket that
  // returns 403 to direct browser requests (referer/hotlink protection). This endpoint
  // fetches the image server-side using the same browser-like headers as the scrapers,
  // then hands the bytes back to the browser so <img> tags render without being blocked.
  @Get("image")
  @Header("Cache-Control", "public, max-age=86400, immutable")
  @Header("X-Content-Type-Options", "nosniff")
  async image(@Query("url") url: string) {
    if (!url || typeof url !== "string" || url.trim().length === 0) {
      throw new BadRequestException("Missing image url.");
    }
    const proxied = await this.service.proxyImage(url);
    if (!proxied) {
      throw new NotFoundException("Image unavailable.");
    }
    return new StreamableFile(proxied.data, { type: proxied.contentType });
  }
}