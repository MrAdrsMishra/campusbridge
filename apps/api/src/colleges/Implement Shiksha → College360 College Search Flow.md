# Implement the new College Search Flow: Shiksha → College360

I want you to modify the existing NestJS `colleges` module to implement the following architecture.

Do NOT rewrite the entire module from scratch. First inspect the existing `colleges.controller.ts`, `colleges.service.ts`, `college.dto.ts`, `college.schema.ts`, and any related files. Reuse existing College360 detail-fetching, mapping, caching, and response types wherever possible.

The required flow is:

```text
User searches
     ↓
Shiksha Autocomplete API
     ↓
Get the relevant Shiksha category URL
     ↓
Shiksha Category Page API
     ↓
Get instituteTuples[]
     ↓
For every returned college:
    take college name
    search that exact college name on College360
    get slug/url + seriesId
     ↓
Return college list to frontend
     ↓
User selects one college
     ↓
Frontend sends slug + seriesId
     ↓
College360 detail API
     ↓
Return mapped CollegeDetailView
```

---

# 1. Step 1 — Shiksha autocomplete/search

Create a service method such as:

```ts
searchShiksha(query: string)
```

This method should call the Shiksha autocomplete endpoint:

```text
https://apis.shiksha.com/apigateway/autosuggestorapi/v1/info/getAutosuggestorResults
```

The request uses the `data` query parameter containing a base64-encoded JSON payload.

The payload follows this structure:

```json
{
  "domain": "national",
  "experiment": "",
  "keyword": "Mass Communi"
}
```

The exact request construction should follow the existing/reference implementation. Do not invent a different Shiksha endpoint or payload format.

The response has this structure:

```json
{
  "status": "success",
  "data": {
    "searchKeyword": "Mass communi",
    "solrResults": [
      {
        "id": 7,
        "groupId": 0,
        "name": "Mass Communication & Media",
        "type": "stream",
        "subType": null,
        "url": "/mass-communication-media/colleges/colleges-india?rf=searchWidget&isource=csearch",
        "questionCount": 0,
        "answerCount": 0,
        "multiple": false,
        "logoUrl": null,
        "ownership": null,
        "localityName": null,
        "cityName": null,
        "stateName": null,
        "countryName": null,
        "fullName": null,
        "shortName": null,
        "abbreviation": null,
        "isPaid": null
      }
    ]
  }
}
```

For now, use the relevant `solrResults` entry and return at minimum:

```ts
{
  name: string;
  url: string;
}
```

Do not return the entire raw Shiksha response unless there is a good reason.

The frontend will use the returned `url` in the next request.

---

# 2. Step 2 — Get colleges from the Shiksha category URL

Create a service method such as:

```ts
getCollegesFromShiksha(url: string)
```

This method receives the URL returned by Step 1.

Example:

```text
/mass-communication-media/colleges/colleges-india?rf=searchWidget&isource=csearch
```

Call the Shiksha category page API:

```text
https://apis.shiksha.com/apigateway/categorypageapi/v4/info/getCategoryPageFullData
```

The request uses the `data` query parameter containing the base64-encoded JSON object with the Shiksha category URL.

Follow the exact request format from the provided/reference implementation. Do not invent another API format.

The important response field is:

```text
data.instituteTuples
```

Example object:

```json
{
  "instituteId": 37023,
  "courseCount": 3,
  "totalSeats": 180,
  "acceptingExams": null,
  "minFees": 0,
  "maxFees": 28000,
  "name": "UNIPUNE - Savitribai Phule Pune University (SPPU)",
  "instituteHeaderImageUrl": "https://images.shiksha.com/...",
  "logoImageUrl": "https://images.shiksha.com/..."
}
```

The Shiksha college object does NOT necessarily contain the College360 slug/seriesId.

Therefore, for every `instituteTuple`, use:

```text
instituteTuple.name
```

as the bridge to College360.

---

# 3. Step 3 — Resolve every Shiksha college against College360

For each Shiksha college:

```ts
const collegeName = instituteTuple.name;
```

Call the existing College360 search endpoint:

```text
https://backend.college360.co.in/api/college360/v1/client/college/search/?search=<encoded college name>
```

Example:

```text
.../client/college/search/?search=UNIPUNE%20-%20Savitribai%20Phule%20Pune%20University%20(SPPU)
```

The College360 search response contains objects like:

```ts
{
  _id: string;
  name: string;
  logo: string;
  type: string[];
  url: string;
  seriesId: number;
}
```

The important fields are:

```ts
name
url
seriesId
```

Map them to:

```ts
slug: item.url
seriesId: item.seriesId
```

---

# 4. College360 name matching

The Shiksha `instituteTuple.name` is the source name.

Search College360 using that exact name.

When College360 returns results, select the matching college by normalized exact name.

Use a normalization function:

```ts
normalizeCollegeName(name: string): string
```

The normalization should:

- trim whitespace
- convert to lowercase
- collapse multiple spaces
- normalize obvious punctuation/spacing differences without changing the actual meaning

Example:

```text
"UNIPUNE - Savitribai Phule Pune University (SPPU)"
```

should be compared against the College360 result name after normalization.

Do NOT blindly use `results[0]`.

The goal is:

```text
Shiksha college name
        ↓
College360 search
        ↓
exact normalized name match
        ↓
one College360 result
        ↓
slug + seriesId
```

If there is no matching College360 result, do not fabricate `slug` or `seriesId`.

Keep the Shiksha college in the response with:

```ts
slug: null
seriesId: null
```

and optionally log the unmatched college.

If multiple results have the same normalized exact name, use the first exact match and log the ambiguity.

---

# 5. Final college-list response

Create a clean internal response type.

Return something similar to:

```ts
export type CollegeListItem = {
  instituteId: number | null;
  name: string;
  logo: string | null;
  headerImage: string | null;
  minFees: number | null;
  maxFees: number | null;

  // College360 mapping
  slug: string | null;
  seriesId: number | null;
};
```

Example:

```json
{
  "instituteId": 37023,
  "name": "UNIPUNE - Savitribai Phule Pune University (SPPU)",
  "logo": "https://images.shiksha.com/...",
  "headerImage": "https://images.shiksha.com/...",
  "minFees": 0,
  "maxFees": 28000,
  "slug": "savitribai-phule-pune-university",
  "seriesId": 12345
}
```

Do not expose unnecessary raw Shiksha or College360 response fields.

---

# 6. Concurrency

Do not make College360 requests completely sequentially for a large `instituteTuples[]` response.

Use controlled concurrency.

The existing service already has a concurrency pattern:

```ts
COURSE_FILTER_CONCURRENCY = 4;
```

Reuse the same concept or create a dedicated constant, for example:

```ts
const COLLEGE360_RESOLVE_CONCURRENCY = 4;
```

Process colleges in batches of 4:

```text
batch 1 → 4 College360 searches
batch 2 → 4 College360 searches
batch 3 → 4 College360 searches
...
```

Do NOT use an unrestricted:

```ts
Promise.all(instituteTuples.map(...))
```

because a Shiksha category may contain many colleges and this could create too many external requests.

---

# 7. Caching

Reuse the existing caching approach in `CollegesService`.

The existing service already has:

```ts
suggestionCache
detailCache
```

and generic cache helpers.

Add a cache for College360 name resolution, for example:

```ts
private readonly college360SearchCache =
  new Map<string, CacheEntry<College360SearchResult[]>>();
```

Use the normalized college name as the cache key.

Suggested TTL:

```ts
10 minutes
```

or reuse the existing suggestion cache TTL if appropriate.

The purpose is to avoid repeatedly calling College360 when the same college appears in multiple searches.

---

# 8. Step 4 — College detail

The user selects a college from the returned list.

The frontend should NOT search College360 again.

It already receives:

```ts
slug
seriesId
```

Therefore the detail request is:

```text
GET /colleges/details?slug=<slug>&seriesId=<seriesId>
```

Keep the existing controller endpoint:

```ts
@Get("details")
async details(@Query() query: CollegeScrapeQueryDto) {
  const result = await this.service.getCollegeDetailView(
    query.slug,
    query.seriesId,
  );

  if (!result) {
    throw new NotFoundException("College not found");
  }

  return result;
}
```

Reuse the existing:

```ts
getCollegeDetailView(slug, seriesId)
```

and existing:

```ts
fetchDetail(slug, seriesId)
```

implementation.

The existing College360 detail endpoint requires BOTH:

```text
slug
seriesId
```

Do not change this to slug-only.

---

# 9. Existing College360 detail mapping

Do not remove the existing detail mapping.

Continue returning:

```ts
{
  name,
  shortDescription,
  logo,
  backgroundImage,
  photos,
  address: {
    full,
    city,
    state
  },
  coursesByCategory,
  reviews
}
```

Reuse the existing mapping functions:

```ts
mapCourses()
groupCoursesByCategory()
simplifyCoursesByCategory()
mapTopReviews()
mapPhotos()
formatAssetUrl()
stripHtml()
```

Do not duplicate this logic.

---

# 10. Controller

Change the controller to represent the new flow.

The desired endpoints are:

```text
GET /colleges/search?query=Mass%20Communi

GET /colleges?url=<shiksha-category-url>

GET /colleges/details?slug=<college360-slug>&seriesId=<college360-series-id>
```

Controller should look conceptually like:

```ts
@Controller("colleges")
export class CollegesController {
  constructor(private readonly service: CollegesService) {}

  @Get("search")
  search(@Query() query: ShikshaSearchQueryDto) {
    return this.service.searchShiksha(query.query);
  }

  @Get()
  all(@Query() query: ShikshaCollegeListQueryDto) {
    return this.service.getCollegesFromShiksha(query.url);
  }

  @Get("details")
  async details(@Query() query: CollegeScrapeQueryDto) {
    const result = await this.service.getCollegeDetailView(
      query.slug,
      query.seriesId,
    );

    if (!result) {
      throw new NotFoundException("College not found");
    }

    return result;
  }
}
```

Use the project's existing validation conventions.

---

# 11. DTOs

Create/update DTOs accordingly.

We need:

```ts
export class ShikshaSearchQueryDto {
  query: string;
}
```

and:

```ts
export class ShikshaCollegeListQueryDto {
  url: string;
}
```

The existing detail DTO should remain:

```ts
export class CollegeScrapeQueryDto {
  slug: string;
  seriesId: number;
}
```

Make sure query-string values are correctly transformed/validated according to the project's existing `ValidationPipe` configuration.

Do not introduce unnecessary DTO fields.

---

# 12. Remove/rework the old search flow

The current service has an old flow where:

```text
college name/city
     ↓
College360 search
     ↓
suggestions
```

That is no longer the primary search flow.

The new primary flow is:

```text
user query
     ↓
Shiksha autocomplete
     ↓
Shiksha category URL
     ↓
Shiksha instituteTuples
     ↓
College360 name resolution
```

Do not delete existing useful College360 detail functionality.

If old methods such as `suggest()` are no longer used anywhere, determine whether they can be safely removed or kept for backward compatibility. Do not remove them blindly if another part of the application uses them.

---

# 13. MongoDB

Do not make MongoDB the source for the new college search/list flow.

The new source of college discovery is:

```text
Shiksha
```

and the source for selected-college detailed information is:

```text
College360
```

The existing MongoDB persistence methods such as `scrapeAndSave()` can remain if they are used elsewhere.

Do not introduce MongoDB writes into the normal search flow unless explicitly required.

---

# 14. Error handling

Handle external API failures safely.

For Shiksha autocomplete:

```text
API failure → appropriate NestJS exception
```

For Shiksha category API:

```text
API failure → appropriate NestJS exception
```

For individual College360 resolution:

```text
College360 search failure
    ↓
do not fail the entire category request
    ↓
return that Shiksha college with
slug: null
seriesId: null
```

One failed College360 lookup should not cause all colleges to disappear.

For College360 detail:

```text
no result → return null
controller → NotFoundException("College not found")
```

Reuse the existing timeout/error handling pattern:

```ts
AbortController
FETCH_TIMEOUT_MS
fetchJson()
```

Do not create a second completely different HTTP abstraction unless necessary.

---

# 15. URL handling

The Shiksha autocomplete returns a relative URL such as:

```text
/mass-communication-media/colleges/colleges-india?rf=searchWidget&isource=csearch
```

Preserve this URL correctly when passing it to the Shiksha category API.

Do not accidentally URL-encode it twice before base64 encoding.

Follow the exact request format used by the provided Shiksha API reference.

---

# 16. Do not expose API keys/secrets

The Shiksha and College360 endpoints currently shown do not require a secret in the examples provided.

Do not hardcode any future API keys.

If an API key is required by the actual existing implementation, use environment variables.

---

# 17. Keep response mapping clean

Do not return raw third-party API responses directly to the frontend.

Create internal application-level types.

The frontend should not need to know that the data came from Shiksha or College360.

For example:

```ts
{
  name,
  logo,
  headerImage,
  minFees,
  maxFees,
  slug,
  seriesId
}
```

instead of returning the entire Shiksha `instituteTuple`.

---

# 18. Expected complete flow

After implementation, the backend should behave like this:

### Request 1

```http
GET /colleges/search?query=Mass%20Communi
```

Backend:

```text
NestJS
 ↓
Shiksha autocomplete
 ↓
solrResults
 ↓
select "Mass Communication & Media"
 ↓
return category URL
```

Response:

```json
{
  "name": "Mass Communication & Media",
  "url": "/mass-communication-media/colleges/colleges-india?rf=searchWidget&isource=csearch"
}
```

---

### Request 2

Frontend sends the returned URL:

```http
GET /colleges?url=<category-url>
```

Backend:

```text
NestJS
 ↓
Shiksha category API
 ↓
data.instituteTuples[]
 ↓
for each institute:
      name
       ↓
      College360 search
       ↓
      exact normalized name
       ↓
      slug + seriesId
 ↓
return clean college list
```

Response:

```json
[
  {
    "instituteId": 37023,
    "name": "UNIPUNE - Savitribai Phule Pune University (SPPU)",
    "logo": "https://images.shiksha.com/...",
    "headerImage": "https://images.shiksha.com/...",
    "minFees": 0,
    "maxFees": 28000,
    "slug": "...",
    "seriesId": 12345
  }
]
```

---

### Request 3

User selects a college.

Frontend already has:

```text
slug
seriesId
```

It sends:

```http
GET /colleges/details?slug=<slug>&seriesId=<seriesId>
```

Backend:

```text
NestJS
 ↓
College360 detail endpoint
 ↓
fetchDetail(slug, seriesId)
 ↓
existing mapping
 ↓
CollegeDetailView
```

Response:

```json
{
  "name": "...",
  "shortDescription": "...",
  "logo": "...",
  "backgroundImage": "...",
  "photos": [],
  "address": {
    "full": "...",
    "city": "...",
    "state": "..."
  },
  "coursesByCategory": {},
  "reviews": []
}
```

---

# 19. Important implementation constraints

1. Inspect the existing code before modifying it.
2. Reuse existing `fetchJson`, timeout handling, caching helpers, College360 detail mapping, and types where appropriate.
3. Do not blindly take `College360 search results[0]`; match by normalized exact college name.
4. Use controlled concurrency when resolving many colleges.
5. Cache College360 name lookups.
6. Do not make MongoDB the source of the new search flow.
7. Do not expose raw third-party API responses.
8. Do not duplicate College360 detail mapping logic.
9. Do not break existing methods that are still used elsewhere.
10. Run TypeScript/build/lint/tests after implementation and fix all compilation errors.
11. Show me the files changed and briefly explain the final request flow.
12. If an API response structure differs from the examples above, inspect the actual response and adapt the types/mapping instead of inventing fields.
13. Do not modify the frontend unless absolutely necessary for the API contract; focus on the NestJS backend.
14. Do not add unnecessary dependencies. Use the project's existing dependencies and native `fetch` where the current service already uses it.

The final goal is a clean production-oriented pipeline:

```text
                 SHIKSHA
                    │
                    ▼
             Autocomplete
                    │
                    ▼
             Category URL
                    │
                    ▼
             Category API
                    │
                    ▼
            instituteTuples[]
                    │
                    │ college name
                    ▼
               COLLEGE360
                    │
                    ▼
             College Search
                    │
              slug + seriesId
                    │
                    ▼
              Frontend List
                    │
              User selects
                    │
                    ▼
             College360 Detail
                    │
                    ▼
          CollegeDetailView
```

Implement this flow in the existing NestJS `colleges` module now.