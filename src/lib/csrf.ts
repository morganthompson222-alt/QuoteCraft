import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

export function validateCsrf(request: NextRequest): NextResponse | null {
  if (SAFE_METHODS.includes(request.method)) {
    return null;
  }

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin) {
    // Same-origin request (no origin header = browser direct)
    return null;
  }

  try {
    const originUrl = new URL(origin);
    if (originUrl.host !== host && !originUrl.host.startsWith("localhost")) {
      return NextResponse.json(
        { error: { message: "CSRF validation failed", statusCode: 403, code: "CSRF_FAILED" } },
        { status: 403 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid origin header", statusCode: 400, code: "INVALID_ORIGIN" } },
      { status: 400 },
    );
  }

  return null;
}
