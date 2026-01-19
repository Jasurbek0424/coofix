import { apiAuth } from "./axios";
import type {
  AuthResponse,
  RegisterData,
  LoginData,
  RefreshTokenData,
  GoogleAuthData,
  UpdateProfileData,
  ChangePasswordData,
} from "@/types/user";

export async function register(data: RegisterData): Promise<AuthResponse> {
  // Backend expects 'name' field, so combine firstName and lastName
  const payload = {
    email: data.email,
    password: data.password,
    phone: data.phone,
    name: [data.firstName, data.lastName].filter(Boolean).join(" ").trim() || undefined,
  };
  
  const res = await apiAuth.post<AuthResponse>("/auth/register", payload);
  return res.data;
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const res = await apiAuth.post<AuthResponse>("/auth/login", data);
  return res.data;
}

export async function refreshToken(data: RefreshTokenData): Promise<AuthResponse> {
  const res = await apiAuth.post<AuthResponse>("/auth/refresh", data);
  return res.data;
}

export async function loginWithGoogle(data: GoogleAuthData): Promise<AuthResponse> {
  const res = await apiAuth.post<AuthResponse>("/auth/google", data);
  return res.data;
}

export async function logout(): Promise<{ success: boolean; message?: string }> {
  const res = await apiAuth.post("/auth/logout");
  return res.data;
}

export async function getProfile(): Promise<AuthResponse> {
  const res = await apiAuth.get<AuthResponse>("/users/profile");
  return res.data;
}

export async function updateProfile(data: UpdateProfileData): Promise<AuthResponse> {
  const res = await apiAuth.patch<AuthResponse>("/auth/profile", data);
  return res.data;
}

export async function changePassword(data: ChangePasswordData): Promise<{ success: boolean; message?: string }> {
  const res = await apiAuth.post("/auth/change-password", data);
  return res.data;
}
