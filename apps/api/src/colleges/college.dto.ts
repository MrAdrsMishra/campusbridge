// src/colleges/dto/college-search-query.dto.ts
import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Length, Matches } from "class-validator";
import { isValidObjectId } from "mongoose";

export class CollegeSearchQueryDto {
  @IsOptional() @IsString() @Length(1, 150) name?: string;
  @IsOptional() @IsString() @Length(1, 100) city?: string;
  @IsOptional() @IsString() @Length(1, 100) state?: string;
  @IsOptional() @IsString() @Length(1, 100) course?: string;
}
// src/colleges/dto/college-scrape-query.dto.ts

// src/colleges/dto/college-scrape-query.dto.ts


// Slug token: College360 slugs ("Viva-Institute-of-Technology-VIOT-Thane") and
// legacy SEO slugs ("A.-C.-Patil-College...(ACPCE)-Navi-Mumbai") — any run of
// non-whitespace chars, bounded in length.
const SLUG_PATTERN = /^\S{3,200}$/;

export class CollegeScrapeQueryDto {
  @IsOptional()
  @IsString()
  @Matches(SLUG_PATTERN, { message: "slug must be a single URL token of 3-200 characters without spaces" })
  slug?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  seriesId?: number;

  // Alternative lookup — pass the college name and optional city/shikshaInstituteId,
  // and the service will resolve its canonical College360 url (slug + seriesId).
  @IsOptional()
  @IsString()
  @Length(1, 200)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  city?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  shikshaInstituteId?: number;
}

// src/colleges/dto/shiksha-search-query.dto.ts
export class ShikshaSearchQueryDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 150)
  query!: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  city?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  state?: string;
}

// src/colleges/dto/shiksha-college-list-query.dto.ts
export class ShikshaCollegeListQueryDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  url!: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  city?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  state?: string;
}
// src/colleges/pipes/parse-object-id.pipe.ts

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!isValidObjectId(value)) {
      throw new BadRequestException("Invalid college id");
    }
    return value;
  }
}