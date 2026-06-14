import { NextResponse } from "next/server";

export async function GET() {
  const url =
    process.env.DMG_DOWNLOAD_URL ||
    "https://files.catbox.moe/3k6f4o.dmg";

  return NextResponse.redirect(url, { status: 307 });
}
