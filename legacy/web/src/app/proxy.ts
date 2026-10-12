import type { NextRequest } from "next/server";

export const handler = async (req: NextRequest) => {
  const url = new URL(req.url);
  const token = req.cookies.get("token")?.value;

  const protectedRoutes = ["/profile", "/profile/orders", "/profile/info"];
  const pathname = url.pathname;

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));

  if (isProtected && !token) {
    return Response.redirect(new URL("/login", req.url));
  }

  return undefined;
};
