import axios from "axios";
import { getSession, signOut } from "next-auth/react";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

apiClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  if (!config.headers["X-Organisation-ID"] && session?.activeOrganisationId) {
    config.headers["X-Organisation-ID"] = session.activeOrganisationId;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await signOut({ redirectTo: "/login" });
    }
    return Promise.reject(error);
  }
);
