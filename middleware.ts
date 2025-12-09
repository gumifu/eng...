import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // デモページのパスをヘッダーに追加
  if (request.nextUrl.pathname === "/demo") {
    response.headers.set("x-pathname", "/demo");
  }

  return response;
}

export const config = {
  matcher: "/demo",
};





