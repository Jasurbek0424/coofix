export interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string; // Backend'dan kelishi mumkin
  phone?: string;
  role?: string;
  avatar?: string;
  // Address fields
  city?: string;
  street?: string;
  building?: string;
  house?: string;
  apartment?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string; // Legacy field
  accessToken?: string; // Backend'dan keladigan asosiy token
  refreshToken?: string;
  message?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RefreshTokenData {
  refreshToken: string;
}

export interface GoogleAuthData {
  idToken: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  city?: string;
  street?: string;
  building?: string;
  house?: string;
  apartment?: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
