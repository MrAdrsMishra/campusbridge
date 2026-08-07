export type College = {
  _id: string;
  name: string;
  city: string;
  state: string;
  about: string;
  courses: string[];
  averageFees?: number;
  reviews: { name: string; rating: number; comment: string }[];
};

export type CollegeSuggestion = {
  id: string;
  name: string;
  slug: string;
  seriesId: number;
  logo: string | null;
};

export type CollegeSearchResponse = {
  searchTerm: string;
  source: "name" | "city";
  suggestions: CollegeSuggestion[];
};

export type CollegePhoto = {
  url: string;
  activity?: string;
};

export type CollegeDetailView = {
  name: string;
  shortDescription: string | null;
  logo: string | null;
  backgroundImage: string | null;
  photos?: CollegePhoto[];
  address: {
    full: string | null;
    city: string | null;
    state: string | null;
  };
  coursesByCategory: Record<string, { name: string; shortForm: string | null }[]>;
  reviews: { rating: number; comment: string }[];
};

export type CitySuggestion = {
  mapbox_id: string;
  name: string;
  full_address: string;
};

export type Testimonial = {
  name: string;
  review: string;
  rating: number;
};

export type Lead = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  course: string;
  city: string;
  budget?: string;
  status: string;
  counselor?: string;
  notes?: string;
  contacted?: "pending" | "yes" | "no";
  interest?: "pending" | "ready" | "unclear";
  response?: string;
  createdAt: string;
};

export type Filters = {
  course: string;
  state: string;
  city: string;
  name: string;
};

export type CounselorSession = { name?: string; email?: string } | null;
