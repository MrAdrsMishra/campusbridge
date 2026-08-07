import { create } from "zustand";

const joinUrl = (baseUrl: string, path: string) => {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");
  return `${normalizedBase}/${normalizedPath}`;
};

type ApiStore = {
  baseUrl: string;
  url: (path: string) => string;
  request: (path: string, init?: RequestInit) => Promise<Response>;
  authHeaders: () => Record<string, string>;
  clearAuth: () => void;
};

export const useApiStore = create<ApiStore>((_set, get) => ({
  baseUrl: import.meta.env.VITE_API_URL ?? "/api",
  url: (path) => joinUrl(get().baseUrl, path),
  request: (path, init) => fetch(joinUrl(get().baseUrl, path), init),
  authHeaders: () => {
    const token = localStorage.getItem("campusbridge.accessToken");
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  },
  clearAuth: () => {
    localStorage.removeItem("campusbridge.accessToken");
    localStorage.removeItem("campusbridge.counselor");
  },
}));