import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

export async function POST(request: NextRequest) {
  const { pin } = await request.json();
  const correctPin = process.env.ACCESS_PIN;
  const secret = process.env.PIN_SECRET || "pibardos-poker-default";

  if (!pin || pin !== correctPin) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }

  // Create a signed cookie value
  const cookieValue = createHash("sha256")
    .update(`${pin}:${secret}`)
    .digest("hex");

  const response = NextResponse.json({ success: true });
  response.cookies.set("poker-access", cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return response;
}
