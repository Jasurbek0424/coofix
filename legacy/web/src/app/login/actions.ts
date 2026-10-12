"use server";

import { cookies } from "next/headers";

export async function setToken(token: string) {
  (await cookies()).set("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function clearToken() {
  (await cookies()).set("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}
