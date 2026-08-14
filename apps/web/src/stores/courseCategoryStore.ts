import { create } from "zustand";

type CourseCategoryStore = {
  // Tracks which categories have all their courses expanded (keyed by category name).
  showAllCourses: Record<string, boolean>;
  handleExpandCourseView: (categoryId: string) => void;
};

export const useCourseCategoryStore = create<CourseCategoryStore>((set) => ({
  showAllCourses: {},

  handleExpandCourseView: (categoryId) =>
    set((state) => ({
      showAllCourses: {
        ...state.showAllCourses,
        [categoryId]: !state.showAllCourses[categoryId],
      },
    })),
}));
