import { NextRequest, NextResponse } from "next/server";
import { removeStorefrontScripts } from "@/features/scripts/sync";
import { verifyBcSignedJwt } from "@/lib/bc/jwt";
import { getActiveStore, markStoreUninstalled } from "@/lib/tenancy/stores";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const claims = await verifyBcSignedJwt(
      request.nextUrl.searchParams.get("signed_payload_jwt"),
    );
    const store = await getActiveStore(claims.storeHash);
    if (store) {
      await removeStorefrontScripts({
        storeHash: store.storeHash,
        encryptedAccessToken: store.accessToken,
        existingScripts: store.scripts,
      });
    }

    await markStoreUninstalled(claims.storeHash);
    return new NextResponse(null, { status: 200 });
  } catch {
    const token = request.nextUrl.searchParams.get("signed_payload_jwt");
    if (token) {
      try {
        const claims = await verifyBcSignedJwt(token);
        await prisma.store.updateMany({
          where: { storeHash: claims.storeHash },
          data: { accessToken: "", uninstalledAt: new Date() },
        });
      } catch {
        // Ignore invalid JWT after a failed uninstall cleanup.
      }
    }
    return new NextResponse(null, { status: 200 });
  }
}
