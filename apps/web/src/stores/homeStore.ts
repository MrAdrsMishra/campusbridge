import { create } from "zustand";
import type {
  CitySuggestion,
  CollegeDetailView,
  CollegeListItem,
  Filters,
  Testimonial,
} from "../types";

type HomeStore = {
  filters: Filters;
  suggestions: CollegeListItem[];
  selectedSuggestion: CollegeListItem | null;
  selectedCollege: CollegeDetailView | null;
  loadingSuggestions: boolean;
  loadingCollege: boolean;
  sent: boolean;
  feedbackSent: boolean;
  rating: number;
  testimonials: Testimonial[];
  citySuggestions: CitySuggestion[];
  setFilter: (key: keyof Filters, value: string) => void;
  setSuggestions: (suggestions: CollegeListItem[]) => void;
  setSelectedSuggestion: (college: CollegeListItem | null) => void;
  setSelectedCollege: (college: CollegeDetailView | null) => void;
  setLoadingSuggestions: (loading: boolean) => void;
  setLoadingCollege: (loading: boolean) => void;
  setSent: (sent: boolean) => void;
  setFeedbackSent: (sent: boolean) => void;
  setRating: (rating: number) => void;
  setTestimonials: (testimonials: Testimonial[]) => void;
  prependTestimonial: (testimonial: Testimonial) => void;
  setCitySuggestions: (citySuggestions: CitySuggestion[]) => void;
};

export const useHomeStore = create<HomeStore>((set) => ({
  filters: { course: "", state: "", city: "", name: "" },
  suggestions: [],
  selectedSuggestion: null,
  selectedCollege: null,
  loadingSuggestions: false,
  loadingCollege: false,
  sent: false,
  feedbackSent: false,
  rating: 5,
  testimonials: [],
  citySuggestions: [],
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  setSuggestions: (suggestions) => set({ suggestions }),
  setSelectedSuggestion: (selectedSuggestion) => set({ selectedSuggestion }),
  setSelectedCollege: (selectedCollege) => set({ selectedCollege }),
  setLoadingSuggestions: (loadingSuggestions) => set({ loadingSuggestions }),
  setLoadingCollege: (loadingCollege) => set({ loadingCollege }),
  setSent: (sent) => set({ sent }),
  setFeedbackSent: (feedbackSent) => set({ feedbackSent }),
  setRating: (rating) => set({ rating }),
  setTestimonials: (testimonials) => set({ testimonials }),
  prependTestimonial: (testimonial) =>
    set((state) => ({
      testimonials: [testimonial, ...state.testimonials].slice(0, 6),
    })),
  setCitySuggestions: (citySuggestions) => set({ citySuggestions }),
}));
