import { NextRequest, NextResponse } from "next/server";
import { verifyBcSignedJwt } from "@/lib/bc/jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await verifyBcSignedJwt(
      request.nextUrl.searchParams.get("signed_payload_jwt"),
    );
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 200 });
  }
}
