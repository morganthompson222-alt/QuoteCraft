import { NextResponse } from "next/server";

export async function GET() {
  const url =
    process.env.EXE_DOWNLOAD_URL;

  if (!url) {
    return NextResponse.redirect(new URL("/install#windows", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"), { status: 307 });
  }

  return NextResponse.redirect(url, { status: 307 });
}
