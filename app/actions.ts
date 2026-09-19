"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { applyStorefrontConfig } from "@/features/install/complete-install";
import { isThemePreset } from "@/features/theme/presets";
import { BcApiError } from "@/lib/bc/client";
import { verifyAppContext } from "@/lib/session";

async function requireStoreHash(formData: FormData): Promise<string> {
  const context = String(formData.get("context") || "");
  const session = await verifyAppContext(context);
  return session.storeHash;
}

function formatActionError(error: unknown): string {
  if (error instanceof BcApiError) {
    const hint =
      error.status === 403
        ? " Missing Content modify scope? Update Developer Portal scopes, then uninstall and reinstall."
        : "";
    return `BigCommerce API ${error.status}: ${error.body || error.message}.${hint}`.slice(
      0,
      400,
    );
  }
  if (error instanceof Error) {
    return error.message.slice(0, 400);
  }
  return "Unknown error";
}

function redirectWithError(context: string, error: unknown): never {
  const params = new URLSearchParams();
  if (context) {
    params.set("context", context);
  }
  params.set("error", formatActionError(error));
  redirect(`/?${params.toString()}`);
}

export async function saveSettingsAction(formData: FormData) {
  const context = String(formData.get("context") || "");
  try {
    const storeHash = await requireStoreHash(formData);
    const themePreset = String(formData.get("themePreset") || "");
    const seoEnabled = formData.get("seoEnabled") === "on";

    if (!isThemePreset(themePreset)) {
      throw new Error("Invalid theme preset");
    }

    await applyStorefrontConfig({ storeHash, themePreset, seoEnabled });
    revalidatePath("/");
  } catch (error) {
    console.error("Save settings failed", error);
    redirectWithError(context, error);
  }
}

export async function repairScriptsAction(formData: FormData) {
  const context = String(formData.get("context") || "");
  try {
    const storeHash = await requireStoreHash(formData);
    const themePreset = String(formData.get("themePreset") || "editorial");
    const seoEnabled = formData.get("seoEnabled") === "on";

    await applyStorefrontConfig({
      storeHash,
      themePreset: isThemePreset(themePreset) ? themePreset : "editorial",
      seoEnabled,
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Repair installation failed", error);
    redirectWithError(context, error);
  }
}
