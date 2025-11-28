import { api } from "./axios";

export async function login(data: { email: string; password: string }) {
  const res = await api.post("/auth/login", data);
  return res.data;
}

export async function logout() {
  const res = await api.post("/auth/logout");
  return res.data;
}

export async function getProfile() {
  const res = await api.get("/auth/profile");
  return res.data;
}
