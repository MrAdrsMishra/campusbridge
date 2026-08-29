You are the senior SEO engineer for this entire project.

Your job is to audit and implement an end-to-end SEO system for this college/admission discovery platform. You have full access to the repository. Do NOT just give recommendations — inspect the existing codebase, understand the current architecture, and implement the improvements directly.

IMPORTANT:
- Do not destroy existing functionality.
- Do not create fake content merely to rank.
- Do not keyword-stuff pages.
- Do not create thousands of near-identical pages.
- Preserve existing API contracts and UI behavior unless an SEO improvement requires a change.
- First inspect the repository and determine whether the frontend is React/Vite, Next.js, SSR, SSG, etc.
- Adapt the implementation to the actual architecture instead of assuming a framework.
- After implementation, run the available build/typecheck/lint/tests and fix regressions.

==================================================
PHASE 1 — FULL SEO AUDIT
==================================================

Audit the complete application.

Inspect:

1. Frontend architecture
2. Routing
3. Rendering strategy
4. SSR/SSG/prerendering possibilities
5. Current title/meta implementation
6. Canonical URLs
7. robots.txt
8. sitemap.xml
9. sitemap generation
10. Open Graph metadata
11. Twitter/X metadata
12. structured data/schema
13. internal links
14. breadcrumbs
15. heading hierarchy
16. image alt text
17. image URLs
18. lazy loading
19. page performance
20. Core Web Vitals risks
21. duplicate URLs
22. query parameters
23. pagination
24. filters
25. faceted navigation
26. 404/soft-404 behavior
27. redirect behavior
28. trailing slash consistency
29. HTTP/HTTPS canonicalization
30. index/noindex logic
31. orphan pages
32. thin pages
33. duplicate college pages
34. duplicate course pages
35. dynamically generated content
36. internal search pages
37. API-dependent SEO content
38. JavaScript-only content that should be crawlable
39. mobile responsiveness
40. page load/network waterfalls

Create an internal SEO audit report first.

Then implement the fixes.

==================================================
PHASE 2 — DEFINE THE SEO INFORMATION ARCHITECTURE
==================================================

The platform is an education/college discovery website.

Build an SEO hierarchy around:

COLLEGE
COURSE
CITY
STATE
SPECIALIZATION
EXAM
ADMISSION
FEES
PLACEMENTS
RANKINGS
COMPARISONS

Use clean human-readable URLs.

Preferred conceptual structure:

/colleges/
/colleges/{college-slug}

/courses/
/courses/{course-slug}

/courses/{course-slug}/{city-slug}

/colleges/{city-slug}

/{course-category}/{city-slug}

/engineering-colleges/{city-slug}
/mba-colleges/{city-slug}
/bba-colleges/{city-slug}
/medical-colleges/{city-slug}
/law-colleges/{city-slug}
/design-colleges/{city-slug}
/commerce-colleges/{city-slug}

Only implement URL patterns that fit the existing data model.

Do NOT blindly create every possible city × course combination.

A landing page should exist only when there is enough real data to make the page genuinely useful.

==================================================
PHASE 3 — KEYWORD STRATEGY
==================================================

Build a keyword taxonomy for the platform.

Primary keyword families:

A. COLLEGE + CITY

Examples:

- engineering colleges in Bhopal
- engineering colleges in Pune
- engineering colleges in Indore
- BTech colleges in Bhopal
- MBA colleges in Bhopal
- BBA colleges in Bhopal
- law colleges in Bhopal
- medical colleges in Bhopal
- private colleges in Bhopal
- government colleges in Bhopal
- best colleges in Bhopal

B. COURSE + CITY

Examples:

- BTech colleges in Bhopal
- BTech CSE colleges in Bhopal
- MBA colleges in Pune
- BBA colleges in Indore
- MCA colleges in Bhopal
- MTech colleges in Bhopal
- BCA colleges in Bhopal

C. FEES

Examples:

- BTech colleges in Bhopal fees
- engineering colleges in Bhopal fees
- MBA colleges in Bhopal fees
- BBA colleges in Bhopal fees
- cheapest engineering colleges in Bhopal
- private engineering colleges in Bhopal fees

D. ADMISSION

Examples:

- BTech admission 2026
- BTech admission in Bhopal
- BTech colleges admission process
- MBA admission 2026
- MBA colleges in Bhopal admission
- college admission 2026
- admission process for BTech

E. PLACEMENTS

Examples:

- best engineering colleges in Bhopal for placement
- BTech colleges in Bhopal placement
- MBA colleges in Bhopal placement
- engineering colleges with best placements
- college placement comparison

F. RANKING / COMPARISON

Examples:

- top engineering colleges in Bhopal
- best engineering colleges in Bhopal
- top private engineering colleges in Bhopal
- government engineering colleges in Bhopal
- BTech college comparison
- college A vs college B
- best colleges for CSE in Bhopal

G. ELIGIBILITY / EXAMS

Examples:

- BTech eligibility
- BTech admission through JEE Main
- engineering colleges accepting JEE Main
- MBA colleges accepting CAT
- MBA eligibility
- BCA eligibility
- MCA eligibility

H. SPECIALIZATION

Examples:

- best CSE colleges in Bhopal
- AI ML colleges in Bhopal
- data science colleges in Bhopal
- cybersecurity colleges in Bhopal
- mechanical engineering colleges in Bhopal
- civil engineering colleges in Bhopal

I. LONG-TAIL

Generate long-tail combinations based on actual available data:

{course} + {city} + fees
{course} + {city} + admission
{course} + {city} + placement
{course} + {city} + eligibility
{course} + {city} + cutoff
{course} + {city} + ranking
{course} + {city} + specializations
{course} + {city} + entrance exam

Do not put every keyword on every page.

Each page must have ONE primary search intent.

==================================================
PHASE 4 — PROGRAMMATIC SEO
==================================================

The website appears suited for programmatic SEO.

Create reusable SEO templates for:

1. College pages
2. Course pages
3. City + course pages
4. City college listing pages
5. State college listing pages
6. Specialization pages
7. Exam-based college pages
8. Comparison pages where real data exists

Each generated page must contain meaningful unique information.

For example:

"Top Engineering Colleges in Bhopal"

should NOT simply be:

- College A
- College B
- College C

Instead include useful sections such as:

- Overview
- Number/type of colleges
- Popular courses
- Top colleges
- Government vs private colleges
- Fee comparison
- Admission requirements
- Entrance exams
- Popular specializations
- Placement information where available
- How to choose a college
- FAQs
- Related city/course links

Use actual database values.

Never fabricate fees, rankings, placement statistics, accreditation, admission dates or cutoff data.

==================================================
PHASE 5 — COLLEGE PAGE SEO
==================================================

Every college page should dynamically generate:

<title>
<meta name="description">
<link rel="canonical">
OpenGraph
Twitter metadata
JSON-LD
breadcrumbs

Example conceptual title:

"SAGE University Bhopal: Courses, Fees, Admission & Placements 2026"

Example conceptual description:

"Explore SAGE University Bhopal courses, fees, admission process, eligibility, placements, facilities and other important details."

Do not use the exact same title/description template blindly if it produces duplicate metadata.

College pages should expose crawlable HTML content containing:

- College name
- Location
- University/institute type
- Courses
- Fees
- Admission information
- Eligibility
- Entrance exams
- Facilities
- Placements if verified
- Related courses
- Related colleges
- FAQs where genuinely useful

==================================================
PHASE 6 — CITY + COURSE LANDING PAGES
==================================================

Create strong landing pages such as:

/engineering-colleges/bhopal
/mba-colleges/bhopal
/bba-colleges/bhopal
/engineering-colleges/indore
/mba-colleges/pune

Only generate pages when sufficient data exists.

Each page should have:

H1:
Best Engineering Colleges in Bhopal

Then:

intro
college count
top colleges
private colleges
government colleges
fees
popular courses
specializations
entrance exams
admission process
comparison
FAQs
related searches/pages

The content must be generated from real database data.

==================================================
PHASE 7 — INTERNAL LINKING ENGINE
==================================================

Build a systematic internal linking strategy.

College page should link to:

- its city page
- course pages
- related colleges
- similar courses
- admission pages
- comparison pages

City page should link to:

- individual colleges
- course-specific city pages
- private colleges
- government colleges
- popular courses
- related cities

Course page should link to:

- popular cities
- colleges offering the course
- related courses
- admission guides
- eligibility information

Use descriptive anchor text.

Avoid:

"Click here"

Prefer:

"Engineering colleges in Bhopal"

"Best BTech colleges in Indore"

"Top MBA colleges in Pune"

Build related-link sections dynamically from actual data.

==================================================
PHASE 8 — BREADCRUMBS
==================================================

Implement visible breadcrumbs and BreadcrumbList JSON-LD.

Example:

Home
→ Engineering Colleges
→ Madhya Pradesh
→ Bhopal
→ College Name

Ensure every URL level actually exists and is indexable.

==================================================
PHASE 9 — STRUCTURED DATA
==================================================

Implement valid Schema.org structured data where applicable.

Potential types:

Organization
WebSite
WebPage
BreadcrumbList
EducationalOrganization
CollegeOrUniversity
Course
FAQPage

Do NOT add schema simply because it exists.

Only use properties that are supported by the actual page content.

Validate that JSON-LD:

- is syntactically valid
- matches visible content
- does not contain fabricated information
- does not contain stale data

==================================================
PHASE 10 — FAQ SEO
==================================================

Add useful FAQs to high-value pages.

Examples:

"What are the best engineering colleges in Bhopal?"

"What is the average BTech fee in Bhopal?"

"Which engineering colleges in Bhopal accept JEE Main?"

"What are the best private engineering colleges in Bhopal?"

But:

DO NOT create generic FAQ spam.

Generate FAQs based on actual page data.

Keep FAQ content directly available in crawlable HTML.

==================================================
PHASE 11 — TECHNICAL SEO
==================================================

Implement:

robots.txt

XML sitemap

Sitemap index if required

Separate sitemaps if the site is large:

sitemap-colleges.xml
sitemap-courses.xml
sitemap-locations.xml
sitemap-pages.xml

Only include canonical, indexable URLs.

Never include:

- admin pages
- authentication pages
- internal search results
- filtered duplicates
- tracking parameters
- non-canonical URLs
- 404 URLs
- thin pages

Add correct canonical URLs.

==================================================
PHASE 12 — FACETED SEARCH PROTECTION
==================================================

This is extremely important.

If the website has filters such as:

?city=bhopal
?course=btech
?fees=100000
?sort=fees
?specialization=cse

prevent uncontrolled URL/index explosion.

Determine which filter combinations deserve indexable landing pages.

For everything else:

- canonicalize appropriately
- noindex where appropriate
- prevent unnecessary crawling
- maintain crawlable links to important SEO landing pages

Do NOT create millions of indexable filter combinations.

==================================================
PHASE 13 — PAGINATION
==================================================

Audit listing pagination.

Ensure important colleges are discoverable through crawlable links.

Do not rely exclusively on JavaScript buttons such as:

"Load More"

If pagination is important for discovery, use real crawlable URLs/links.

Avoid creating duplicate canonical pages.

==================================================
PHASE 14 — SEARCH ENGINE RENDERING
==================================================

Determine whether important SEO content is available in the initial HTML.

Important content must not depend unnecessarily on:

- client-side API calls
- delayed JavaScript
- user interaction
- modal opening
- infinite scroll

If the current architecture is SPA-only, determine the best practical solution:

- SSR
- SSG
- prerendering
- static generation
- server-side HTML generation

Implement the solution appropriate to the existing stack.

Do NOT rewrite the entire application unnecessarily.

==================================================
PHASE 15 — IMAGE SEO
==================================================

Audit every important image.

Implement:

- descriptive filenames where controllable
- meaningful alt text
- width/height
- lazy loading for below-fold images
- optimized formats
- responsive images
- proper OpenGraph images
- canonical/preferred image metadata where relevant

Do not stuff keywords into alt attributes.

==================================================
PHASE 16 — PERFORMANCE
==================================================

Optimize SEO-critical performance.

Audit:

- JavaScript bundle size
- unused JS
- API waterfalls
- image sizes
- layout shifts
- font loading
- unnecessary client requests
- slow API calls
- rendering delays

Prioritize:

LCP
INP
CLS

Do not sacrifice UX just to improve Lighthouse scores.

==================================================
PHASE 17 — CONTENT QUALITY / ANTI-THIN-CONTENT
==================================================

Identify pages that are:

- duplicates
- near duplicates
- extremely short
- automatically generated without useful information
- empty category pages
- pages with insufficient college/course data

For each:

1. improve it with real data
2. merge it with another page
3. canonicalize it
4. noindex it
5. or remove it

Choose the correct solution rather than indexing everything.

==================================================
PHASE 18 — SEO CONTENT HUB
==================================================

Create a scalable content architecture.

Potential content areas:

/guides/
/admission/
/exams/
/courses/
/college-comparisons/

Examples:

/guides/btech-admission
/guides/how-to-choose-engineering-college
/guides/btech-vs-bca
/guides/btech-vs-bsc
/guides/mba-vs-pgdm

Build internal links from these guides to relevant college/course pages.

Do not create articles merely to target keywords.

==================================================
PHASE 19 — LOCATION SEO
==================================================

Use a scalable city/state architecture.

Prioritize major education markets.

Examples:

Bhopal
Indore
Pune
Mumbai
Bangalore
Delhi
Hyderabad
Chennai
Kolkata
Jaipur
Ahmedabad
Lucknow
Nagpur
Noida
Gurgaon
Chandigarh

But ONLY create city pages when the database contains meaningful college/course data.

Create:

city → course → colleges

relationships.

Also create state-level pages when useful.

==================================================
PHASE 20 — SEO METADATA ENGINE
==================================================

Do not hardcode metadata into individual components.

Create reusable SEO utilities/functions.

For example conceptually:

generateCollegeSEO(college)
generateCourseSEO(course)
generateCitySEO(city)
generateCourseCitySEO(course, city)

Ensure:

- title length is sensible
- descriptions are unique
- canonical is correct
- OG title/description are correct
- OG image is valid
- no undefined values
- no duplicate titles
- no accidental "undefined" or "null"

==================================================
PHASE 21 — SEO DATA MODEL
==================================================

Inspect the database/API.

Identify fields that can power SEO:

college name
slug
city
state
courses
course slug
fees
eligibility
entrance exams
specializations
placements
college type
affiliation
accreditation
facilities
logos
header images

If fields are missing, DO NOT invent them.

Build the SEO layer around the data that actually exists.

==================================================
PHASE 22 — SEARCH CONSOLE READINESS
==================================================

Prepare the website for Google Search Console.

Verify:

- sitemap
- robots
- canonical
- indexability
- HTTP status codes
- redirects
- 404s
- internal linking
- mobile rendering

If possible, create an SEO diagnostics page/tool for development that reports:

URL
title
description
canonical
robots
H1
word/content count
schema
indexability
internal links
image alt coverage

==================================================
PHASE 23 — SEO QUALITY GATES
==================================================

Create automated checks where practical.

For every important page type verify:

[ ] exactly one primary H1
[ ] title exists
[ ] description exists
[ ] canonical exists
[ ] canonical matches intended URL
[ ] no accidental noindex
[ ] valid structured data
[ ] breadcrumb exists
[ ] meaningful content exists
[ ] internal links exist
[ ] images have alt text
[ ] no broken links
[ ] no duplicate metadata

==================================================
PHASE 24 — KEYWORD MAPPING
==================================================

Create a central keyword mapping/configuration.

Example concept:

engineering + bhopal
→ primary: "engineering colleges in bhopal"

btech + bhopal
→ primary: "btech colleges in bhopal"

mba + bhopal
→ primary: "mba colleges in bhopal"

btech + bhopal + fees
→ primary: "btech colleges in bhopal fees"

Do NOT place all keywords into one page.

Map one primary intent to one canonical landing page.

==================================================
PHASE 25 — COMPETITOR-INSPIRED BUT ORIGINAL
==================================================

Use major Indian education portals as SERP references only.

Study the kinds of search intents they cover, such as:

- college + city
- BTech + city
- fees
- admission
- courses
- rankings
- private/government
- placement
- entrance exams
- specialization

Do NOT copy their text.

The objective is to build a better structured and more useful experience.

==================================================
PHASE 26 — SEO URL RULES
==================================================

Enforce:

lowercase URLs

hyphen-separated slugs

no unnecessary IDs

no query parameters for canonical landing pages

no duplicate trailing slash variants

no uppercase URLs

no session IDs

stable URLs

Example:

GOOD:

/engineering-colleges/bhopal

/colleges/sage-university-bhopal

/engineering-colleges/bhopal/cse

BAD:

/college?id=123

/college/SAGE_University_Bhopal

/engineering?city=Bhopal&course=BTech

==================================================
PHASE 27 — IMPLEMENTATION
==================================================

Now actually modify the project.

Before editing:

1. inspect repository
2. identify frontend
3. identify backend
4. identify routing
5. identify data sources
6. identify current SEO
7. identify deployment architecture

Then implement the highest-impact changes first.

Prioritize:

P0:
- crawlability
- rendering
- canonical
- robots
- sitemap
- indexability
- metadata
- broken URLs

P1:
- city/course landing pages
- college page SEO
- internal linking
- breadcrumbs
- structured data

P2:
- content hubs
- comparisons
- advanced programmatic SEO
- SEO diagnostics
- performance improvements

==================================================
PHASE 28 — FINAL VALIDATION
==================================================

After implementation:

Run:

- npm/pnpm/yarn build
- typecheck
- lint
- tests

Then inspect representative URLs.

Test at least:

1 college page
1 course page
1 city page
1 course + city page
1 listing page
1 paginated page
1 404 page

Check the actual rendered HTML, not just React component source.

Ensure Google can discover:

Home
→ Category
→ City
→ Course
→ College

without requiring user interaction.

==================================================
FINAL DELIVERABLE
==================================================

At the end, provide a concise report containing:

1. Current SEO problems discovered
2. Changes implemented
3. New URL architecture
4. Keyword architecture
5. New sitemap strategy
6. Structured data implemented
7. Internal linking strategy
8. Rendering/SSR changes
9. Performance improvements
10. Pages that should be indexed
11. Pages that should be noindexed
12. Remaining SEO risks
13. Files changed
14. Build/test results
15. Recommended next SEO tasks

Do not stop at analysis.

Implement the changes directly in the repository.