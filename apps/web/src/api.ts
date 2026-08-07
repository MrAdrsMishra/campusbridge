import { useApiStore } from "./stores/apiStore";

export const API = useApiStore.getState().baseUrl;
