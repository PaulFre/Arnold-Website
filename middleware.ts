import { NextRequest, NextResponse } from "next/server";

const adminUser = process.env.ADMIN_USER;
const adminPass = process.env.ADMIN_PASS;

function unauthorizedResponse(): NextResponse {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Arnold Internal", charset="UTF-8"'
    }
  });
}

export function middleware(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) {
    return unauthorizedResponse();
  }

  const encoded = auth.slice(6);
  const decoded = atob(encoded);
  const separatorIndex = decoded.indexOf(":");
  const user = separatorIndex >= 0 ? decoded.slice(0, separatorIndex) : "";
  const pass = separatorIndex >= 0 ? decoded.slice(separatorIndex + 1) : "";

  if (!adminUser || !adminPass || user !== adminUser || pass !== adminPass) {
    return unauthorizedResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/internal/:path*", "/api/internal/:path*"]
};
