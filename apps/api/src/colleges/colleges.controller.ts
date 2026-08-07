// src/colleges/colleges.controller.ts
import { Controller, Get, NotFoundException, Param, Query } from "@nestjs/common";
import { CollegesService } from "./colleges.service";
import { CollegeScrapeQueryDto, CollegeSearchQueryDto, ParseObjectIdPipe } from "./college.dto";


@Controller("colleges")
export class CollegesController {
  constructor(private readonly service: CollegesService) {}

  @Get()
  all(@Query() query: CollegeSearchQueryDto & { page?: number; limit?: number }) {
    return this.service.findAll(query);
  }

  // Priority inside the service: name if provided, else city. Course narrows the results further.
  @Get("suggestions")
  suggestions(@Query() query: CollegeSearchQueryDto) {
    return this.service.suggest(query);
  }

  // Client sends back the `slug` (the `url` field) from a chosen suggestion —
  // never a raw URL. Domain is hardcoded server-side in the service, so this
  // route has no SSRF surface regardless of what's sent here.
@Get("scrape")
scrape(@Query() query: CollegeScrapeQueryDto) {
  return this.service.scrape(query.slug, query.seriesId); // full payload
}

@Get("details")
async details(@Query() query: CollegeScrapeQueryDto) {
  const result = await this.service.getCollegeDetailView(query.slug, query.seriesId);
  if (!result) throw new NotFoundException("College not found");
  return result;
}

  @Get(":id")
  one(@Param("id", ParseObjectIdPipe) id: string) {
    return this.service.findOne(id);
  }
}