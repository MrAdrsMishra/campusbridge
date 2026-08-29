# Autonomous SEO Engineering Mission

You are the lead SEO engineer and senior full-stack engineer for this repository.

Your objective is to make this website technically strong, crawlable, indexable, scalable, and highly competitive for Indian college/admission search queries.

You have full access to the repository.

DO NOT blindly implement a predefined architecture.

You must first inspect the existing application, understand how it works, identify the highest-impact SEO problems, and then autonomously implement the correct solution.

Your operating loop is:

DISCOVER → ANALYZE → PLAN → IMPLEMENT → VALIDATE → FIX → REVALIDATE

Do not stop after producing a report.

Actually modify the repository.

---

# GLOBAL RULES

1. Preserve existing functionality.
2. Do not rewrite the application unnecessarily.
3. Do not create fake college/course/fee/placement data.
4. Do not keyword-stuff content.
5. Do not generate thin programmatic pages.
6. Do not create millions of indexable filter combinations.
7. Do not duplicate pages under multiple URLs.
8. Do not assume the current architecture is SEO-safe.
9. Prefer simple, maintainable solutions.
10. Every SEO decision must be based on the actual code/data architecture.
11. Run tests/build/typecheck after meaningful changes.
12. If an approach fails, diagnose why and try the next appropriate approach.
13. Continue until the SEO acceptance criteria at the end are satisfied.

---

# PHASE 0 — REPOSITORY RECONNAISSANCE

Before changing anything, inspect the repository.

Determine:

- frontend framework
- backend framework
- package manager
- build system
- routing
- deployment platform
- API architecture
- database
- data fetching strategy
- rendering strategy
- authentication
- existing SEO implementation
- sitemap implementation
- robots implementation
- existing schema
- existing content architecture

Inspect:

- package.json
- frontend entry points
- routing files
- public directory
- build configuration
- deployment configuration
- API routes
- college/course data models
- college detail page
- CityCourseLandingPage
- GuidesPage
- GuideDetailPage
- SeoDiagnosticsPage
- Footer
- image handling
- API/data fetching hooks
- environment configuration

Do not modify anything yet.

Create a temporary internal understanding of:

ARCHITECTURE
→ ROUTING
→ DATA
→ RENDERING
→ SEO
→ DEPLOYMENT

---

# PHASE 1 — DETERMINE THE REAL SEO RENDERING PROBLEM

This is the highest priority.

Determine whether important public pages are:

A. server rendered
B. statically generated
C. prerendered
D. client-side rendered SPA

Test representative URLs.

At minimum inspect:

/

/colleges/bhopal

/engineering-colleges/bhopal

/courses/btech/bhopal

/college/example

/guides/example

Determine what exists in:

1. initial HTTP response
2. page source
3. rendered DOM after JavaScript

Specifically check whether important content such as:

<h1>
college names
course information
fees
descriptions
breadcrumbs
FAQ content

exists without requiring client-side JavaScript execution.

If the site is client-rendered only, determine the least disruptive way to provide crawlable HTML.

Possible solutions:

- SSR
- SSG
- prerendering
- static generation
- hybrid rendering
- migration of only public SEO pages

Do NOT automatically migrate the whole application.

Choose the solution based on the actual repository.

Document why you selected it, then implement it.

---

# PHASE 2 — URL ARCHITECTURE AUDIT

Inspect every existing route.

Current architecture contains routes resembling:

/colleges
/colleges/:citySlug
/colleges/detail/:slug
/college-detail
/college-detail/:slug
/college-details
/college-details/:slug

Determine which URLs represent:

- directory
- city
- course
- individual college
- guides
- private application pages

Create ONE canonical URL for each entity.

Preferred conceptual structure:

/colleges
/colleges/:citySlug

/college/:collegeSlug

/courses/:courseSlug
/courses/:courseSlug/:citySlug

/engineering-colleges/:citySlug
/mba-colleges/:citySlug
/bba-colleges/:citySlug
/medical-colleges/:citySlug
/law-colleges/:citySlug
/design-colleges/:citySlug
/commerce-colleges/:citySlug

/guides
/guides/:slug

Do not blindly adopt this structure.

Use the existing data model and routing requirements to determine the best final structure.

Remove unnecessary duplicate routes.

For legacy URLs that must remain accessible:

OLD URL
→ 301
→ CANONICAL URL

Never render identical content at multiple URLs.

---

# PHASE 3 — ROUTING CONFLICT ANALYSIS

Analyze dynamic route collisions.

For example:

/colleges/:citySlug

must not accidentally collide with individual college URLs.

Ensure the routing system can unambiguously resolve:

/colleges/bhopal

versus

/college/sage-university-bhopal

Test:

- valid city
- invalid city
- valid college
- invalid college
- valid course
- invalid course
- valid guide
- invalid guide

---

# PHASE 4 — ERROR AND STATUS CODE SYSTEM

Find all situations where invalid URLs redirect to valid pages.

Especially detect:

<Route path="*" element={<Navigate to="/" />} />

Do not use homepage redirects for nonexistent pages.

Implement a proper:

NotFoundPage

Invalid entity pages must result in appropriate 404 behavior.

If the deployment architecture allows server-level status codes, ensure the HTTP response is actually 404 rather than returning 200 with a visual 404 page.

Test:

/random-invalid-url

/engineering-colleges/nonexistent-city

/college/nonexistent-college

/courses/nonexistent-course

---

# PHASE 5 — INDEXABILITY MODEL

Create a centralized indexability policy.

Classify URLs into:

INDEX
NOINDEX
REDIRECT
404

INDEX examples:

- useful college pages
- useful city pages
- useful course pages
- useful course + city pages
- useful guides

NOINDEX examples:

- dashboard
- login
- internal tools
- SEO diagnostics
- arbitrary search/filter combinations
- thin pages
- duplicate pages

REDIRECT:

legacy URLs

404:

nonexistent entities

Do not scatter robots logic throughout random components.

Create a reusable SEO/indexability mechanism.

---

# PHASE 6 — SEO METADATA ENGINE

Create a centralized SEO system.

Do not hardcode metadata separately across pages.

Create reusable functions/components appropriate to the project's framework.

Conceptually:

generateCollegeSEO()
generateCitySEO()
generateCourseSEO()
generateCourseCitySEO()
generateGuideSEO()

Every indexable page should have:

- title
- meta description
- canonical
- robots
- OpenGraph title
- OpenGraph description
- OpenGraph image
- Twitter metadata

Ensure:

- no undefined metadata
- no null metadata
- no duplicate titles where avoidable
- canonical always points to the intended URL
- titles match actual page intent

---

# PHASE 7 — KEYWORD INTENT ARCHITECTURE

Build a keyword-to-page mapping system.

Primary keyword families:

COLLEGE + CITY

Examples:

engineering colleges in Bhopal
BTech colleges in Bhopal
MBA colleges in Bhopal
BBA colleges in Bhopal
engineering colleges in Indore
BTech colleges in Pune

FEES:

BTech colleges in Bhopal fees
engineering colleges in Bhopal fees
MBA colleges in Bhopal fees

ADMISSION:

BTech admission 2026
BTech admission in Bhopal
MBA admission 2026
MBA admission in Bhopal

PLACEMENTS:

best engineering colleges in Bhopal for placement
BTech colleges in Bhopal placement

SPECIALIZATION:

best CSE colleges in Bhopal
AI ML colleges in Bhopal
data science colleges in Bhopal
cybersecurity colleges in Bhopal

COMPARISON:

BTech college comparison
college A vs college B

LONG TAIL:

course + city + fees
course + city + admission
course + city + placement
course + city + eligibility
course + city + cutoff
course + city + entrance exam

Do not put all keywords into every page.

Each page should have one dominant search intent.

---

# PHASE 8 — DATA-DRIVEN PROGRAMMATIC SEO & EXTENDED DATA EXTRACTION

Inspect the NestJS backend services and MongoDB schemas (`CollegesService`, `CollegeSchema`).

The API extracts and normalizes the following verified fields from Shiksha and College360 API gateways:

- **Identity**: `name`, canonical `slug`, `seriesId`, `shiksha_instituteId`, `instituteId`
- **Location**: `city`, `state`, `fullAddress`
- **Classification**: `collegeType` (e.g. `Private`, `Public / Government`), `coursesByCategory`
- **Financials**: `averageFees` (computed mean tuition), `minFees`, `maxFees`
- **Ratings & Reviews**: `aggregateRating` (0–10 scale), top student `reviews` array
- **Infrastructure**: `facilities` array (e.g. `Library`, `Hostel`, `Sports`, `Labs`, `WiFi`)
- **Assets**: `logo`, `backgroundImage`, `photos` array (proxied via `/colleges/image` hotlink proxy)

Rules:
- Never fabricate missing attributes.
- Expose real attributes via the `/colleges/details` and `/colleges` REST endpoints.
- Generate landing pages only when sufficient real data exists.

---

# PHASE 9 — COLLEGE SEO TEMPLATE & RICH STRUCTURED DATA

Audit `CollegeDetail.tsx` and `seoUtils.ts`.

Build a strong information hierarchy using real extracted data:

1. **Breadcrumb Bar**: `Home` → `Colleges` → `{City}` → `{College Name}`
2. **H1 Title**: `{College Name}`
3. **Location Subtitle**: `{City}, {State}`
4. **Key Overview Statistics Bar**:
   - **Average Fees**: Formatted in INR (`₹X / yr`) or fallback
   - **Rating Score**: `AggregateRating` badge (out of 10)
   - **Institution Type**: `Private` / `Government` badge
5. **Campus Facilities Section**: Grid of verified facility badges with checkmark indicators
6. **Courses Offered**: Grouped by category chips
7. **Verified Student Reviews**: Top student rating scores and comments
8. **Contextual FAQs**: Generated deterministically using actual college fees, city, and course data
9. **Internal Related Links**: Cross-city and adjacent course recommendation links
10. **Structured Data**: `EducationalOrganization` JSON-LD schema with `AggregateRating`, `makesOffer` (fees), `amenityFeature` (facilities), and `PostalAddress`

Generate title pattern:
`{College Name} {City}: Courses, Fees, Admission & Placements 2026`

---

# PHASE 10 — CITY + CATEGORY SEO

Audit CityCourseLandingPage.

Ensure it supports meaningful landing pages such as:

/engineering-colleges/bhopal
/mba-colleges/bhopal
/bba-colleges/bhopal

Each page should contain real, useful information:

- introduction
- number of colleges
- college list
- college types
- fees
- popular courses
- specializations
- admission information
- entrance exams
- related pages
- FAQs

Do not simply display a list of college names.

---

# PHASE 11 — COURSE + CITY SEO

Create useful pages for combinations supported by the data.

Examples:

/courses/btech/bhopal
/courses/mba/bhopal
/courses/bca/indore

Do not generate every theoretical combination.

Implement a data-quality threshold.

Conceptually:

if usefulDataCount >= threshold:
    index
else:
    do not index

Choose a sensible threshold based on the existing data.

---

# PHASE 12 — INTERNAL LINKING ENGINE

Build systematic internal linking.

College:

→ city
→ category
→ course
→ related colleges
→ guides

City:

→ category
→ courses
→ colleges
→ related cities

Course:

→ cities
→ colleges
→ related courses
→ guides

Guide:

→ relevant courses
→ relevant cities
→ relevant colleges

Use descriptive anchors.

Avoid generic:

"Click here"

Prefer:

"Engineering colleges in Bhopal"

"Best BTech colleges in Indore"

Make links crawlable HTML anchors.

Do not rely solely on JavaScript click handlers.

---

# PHASE 13 — BREADCRUMBS

Implement visible breadcrumbs.

Examples:

Home
→ Engineering Colleges
→ Bhopal

Home
→ Engineering Colleges
→ Bhopal
→ College Name

Add BreadcrumbList structured data.

Ensure every breadcrumb URL actually exists.

---

# PHASE 14 — STRUCTURED DATA

Implement valid Schema.org structured data appropriate to actual content.

Potential types:

Organization
WebSite
WebPage
BreadcrumbList
CollegeOrUniversity
Course
FAQPage

Rules:

- schema must match visible content
- never fabricate ratings
- never fabricate reviews
- never fabricate rankings
- never fabricate fees
- validate JSON-LD
- avoid irrelevant schema

---

# PHASE 15 — FAQ SYSTEM

Audit existing FAQ implementation.

FAQs must:

- answer genuine user questions
- be visible in crawlable HTML
- use actual data where required
- avoid keyword stuffing
- avoid repetitive questions

Potential questions:

What are the best engineering colleges in Bhopal?

What are the fees for BTech colleges in Bhopal?

Which colleges accept JEE Main?

What are the best private engineering colleges in Bhopal?

Generate only questions relevant to that page.

---

# PHASE 16 — FACETED SEARCH PROTECTION

Inspect all filtering/search URLs.

Look for:

?city=
?course=
?fees=
?specialization=
?sort=
?page=

Determine which URL combinations deserve indexable landing pages.

Important SEO combinations should receive clean URLs.

Example:

/engineering-colleges/bhopal

should be indexable.

Arbitrary:

/colleges?city=bhopal&fees=50000&sort=rating

should generally not become an indexable SEO page.

Prevent crawl/index explosions.

---

# PHASE 17 — PAGINATION

Inspect college listings.

If pagination exists:

ensure pages are crawlable.

Avoid making important college pages reachable only through:

- JavaScript load more
- infinite scrolling
- hidden state
- client-only interactions

Use crawlable links wherever appropriate.

---

# PHASE 18 — SITEMAP SYSTEM

Inspect existing sitemap implementation.

Build a scalable sitemap architecture.

If necessary:

/sitemap.xml

as an index containing:

/sitemap-colleges.xml
/sitemap-cities.xml
/sitemap-courses.xml
/sitemap-guides.xml

Only include:

- canonical URLs
- indexable URLs
- 200-status pages
- useful pages

Never include:

- noindex pages
- redirects
- 404s
- duplicate URLs
- filter combinations
- private pages

Ensure sitemap generation uses real database data.

---

# PHASE 19 — ROBOTS.TXT

Create or audit:

/robots.txt

Allow useful public content.

Prevent unnecessary crawling of:

- private application routes
- internal tools
- arbitrary filter URLs

Do not use robots.txt as a substitute for noindex when Google may need to see the noindex directive.

---

# PHASE 20 — IMAGE SEO

Audit all major images.

Implement:

- meaningful alt text
- dimensions
- responsive images
- modern formats where practical
- lazy loading below the fold
- correct LCP image loading
- OG images

Never keyword-stuff alt text.

---

# PHASE 21 — CORE WEB VITALS

Audit:

LCP
INP
CLS

Identify:

- huge JS bundles
- unnecessary API calls
- API waterfalls
- large images
- layout shifts
- blocking fonts
- excessive client-side rendering

Fix the highest-impact issues.

Do not optimize meaningless Lighthouse metrics at the expense of UX.

---

# PHASE 22 — CONTENT QUALITY ANALYSIS

Programmatically identify:

- duplicate pages
- near-duplicate pages
- empty pages
- thin pages
- city pages with insufficient colleges
- course pages with insufficient information
- duplicate college records
- pages with missing descriptions

For each page determine:

KEEP + INDEX

IMPROVE

MERGE

NOINDEX

REMOVE

Do not index everything just because a URL exists.

---

# PHASE 23 — COLLEGE DATA DUPLICATION

Inspect college names and slugs.

Look for duplicates caused by:

- abbreviations
- alternate names
- punctuation
- university naming differences
- source-specific names

Build canonical entity matching where necessary.

Do not create separate SEO pages for the same institution merely because two sources name it differently.

---

# PHASE 24 — SEO DIAGNOSTICS

Improve the existing:

/seo-diagnostics

tool.

It should be development/admin-oriented.

For a URL report:

- title
- description
- canonical
- robots
- H1
- content length
- schema
- breadcrumb
- internal links
- image alt coverage
- HTTP status
- indexability

If practical, allow checking an entire route class.

---

# PHASE 25 — AUTOMATED SEO QUALITY GATES

Create automated tests/checks.

For every indexable page:

[PASS] title exists
[PASS] description exists
[PASS] canonical exists
[PASS] one primary H1
[PASS] crawlable content
[PASS] valid schema
[PASS] breadcrumb
[PASS] internal links
[PASS] image alt
[PASS] no accidental noindex
[PASS] no duplicate canonical
[PASS] no broken internal links

For invalid pages:

[PASS] 404

For legacy pages:

[PASS] 301

---

# PHASE 26 — SEARCH INTENT COVERAGE

After technical SEO is complete, analyze the site's coverage of these intents:

1. college discovery
2. course discovery
3. city discovery
4. fees
5. admission
6. eligibility
7. entrance exams
8. placements
9. specializations
10. comparisons
11. guides

Identify missing high-value pages based on actual available data.

Do not create pages simply because a keyword exists.

---

# PHASE 27 — AUTONOMOUS ITERATION

After implementing everything:

1. run build
2. run typecheck
3. run lint
4. run tests
5. inspect generated HTML
6. inspect routes
7. inspect metadata
8. inspect sitemap
9. inspect robots
10. inspect representative pages

If something fails:

DIAGNOSE → FIX → RUN AGAIN

Do not stop at the first failure.

Continue until the acceptance criteria pass.

---

# PHASE 28 — FINAL SEO ACCEPTANCE TEST

The following must pass.

## Technical

[ ] public SEO pages are crawlable
[ ] important content is present in crawlable HTML
[ ] canonical URLs are consistent
[ ] duplicate college URLs eliminated
[ ] legacy URLs redirect correctly
[ ] invalid URLs return 404
[ ] private pages are not indexable
[ ] sitemap works
[ ] robots works
[ ] no URL explosion from filters
[ ] pagination is crawlable

## On-page

[ ] unique title
[ ] useful meta description
[ ] one H1
[ ] correct heading hierarchy
[ ] meaningful content
[ ] descriptive image alt
[ ] internal links
[ ] breadcrumbs

## Structured data

[ ] valid JSON-LD
[ ] schema matches visible content
[ ] no fabricated structured data

## Programmatic SEO

[ ] city pages use real data
[ ] course pages use real data
[ ] course + city pages use real data
[ ] thin pages are controlled
[ ] duplicate pages are controlled

## Performance

[ ] LCP investigated
[ ] INP investigated
[ ] CLS investigated
[ ] major image issues fixed
[ ] unnecessary JS/API work reduced

---

# FINAL REPORT

When finished, provide:

1. SEO problems discovered
2. Root cause of each major problem
3. Changes implemented
4. Files modified
5. Final URL architecture
6. Rendering strategy
7. Index/noindex strategy
8. Sitemap architecture
9. Keyword/page architecture
10. Internal linking architecture
11. Schema implemented
12. Performance improvements
13. Duplicate/thin pages identified
14. Tests executed
15. Build status
16. Remaining risks
17. Recommended next actions

IMPORTANT:

Do not merely tell me what should be done.

Inspect the repository.

Make the changes.

Test the changes.

Fix failures.

Then report what you actually changed.