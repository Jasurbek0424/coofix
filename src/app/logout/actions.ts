"use server";
import { clearToken } from "../login/actions";

export async function logoutAction() {
  await clearToken();
}
