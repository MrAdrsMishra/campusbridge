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

  // Dynamic XML Sitemap Endpoint for Search Engine Crawlers.
  // Emits every known college detail page from the DB plus the static section,
  // city and category pages, so college pages are discoverable without
  // executing the app's client-side JavaScript.
  @Get("sitemap.xml")

  @Header("Content-Type", "application/xml")
  @Header("Cache-Control", "public, max-age=3600")
  async getSitemapXml() {
    const origin = "https://nexteduwise.com";
    const cities = [
      "bhopal",
      "indore",
      "pune",
      "mumbai",
      "delhi",
      "bangalore",
      "hyderabad",
      "chennai",
      "kolkata",
      "ahmedabad",
      "jaipur",
      "noida",
      "gurgaon",
      "chandigarh",
      "lucknow",
      "nagpur",
      "coimbatore",
    ];

    const categories = [
      "engineering",
      "btech",
      "mtech",
      "bca",
      "mca",
      "polytechnic",
      "mba",
      "bba",
      "pgdm",
      "medical",
      "mbbs",
      "bds",
      "nursing",
      "pharmacy",
      "bpharma",
      "mpharma",
      "bsc",
      "msc",
      "law",
      "llb",
      "ba-llb",
      "design",
      "bdes",
      "arts",
      "ba",
      "ma",
      "journalism",
      "mass-communication",
      "commerce",
      "bcom",
      "mcom",
      "architecture",
      "barch",
      "hotel-management",
      "hm",
      "bed",
      "med",
      "agriculture",
    ];

    // Generate pure city landing pages (/colleges/bhopal, etc.)
    const pureCityUrls = cities
      .map(
        (city) => `
  <url>
    <loc>${origin}/colleges/${city}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>`,
      )
      .join("");

    // Generate category + city landing pages (/btech-colleges/bhopal, etc.)
    const categoryCityUrls = cities
      .map((city) =>
        categories
          .map(
            (cat) => `
  <url>
    <loc>${origin}/${cat}-colleges/${city}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`,
          )
          .join(""),
      )
      .join("");

    const collegeUrls = (await this.service.getCollegeSitemapEntries())
      .map(
        (c) => `
  <url>
    <loc>${origin}/colleges/detail/${c.slug}</loc>
    <lastmod>${c.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
      )
      .join("");

    const blogSlugs = [
      "btech-admission-2026-guide",
      "best-engineering-colleges-india-2026",
      "how-to-choose-the-right-college-india",
      "best-btech-branches-2026",
      "college-admission-2026-guide",
    ];

    const guideUrls = blogSlugs
      .map(
        (slug) => `
  <url>
    <loc>${origin}/guides/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`,
      )
      .join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${origin}/colleges</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${origin}/guides</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>${guideUrls}${pureCityUrls}${categoryCityUrls}${collegeUrls}
</urlset>`;
  }

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
  @Get(["details", "detail"])
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