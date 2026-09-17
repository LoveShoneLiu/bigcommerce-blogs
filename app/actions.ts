"use server";

import { revalidatePath } from "next/cache";
import { applyStorefrontConfig } from "@/features/install/complete-install";
import { isThemePreset } from "@/features/theme/presets";
import { verifyAppContext } from "@/lib/session";

async function requireStoreHash(formData: FormData): Promise<string> {
  const context = String(formData.get("context") || "");
  const session = await verifyAppContext(context);
  return session.storeHash;
}

export async function saveSettingsAction(formData: FormData) {
  const storeHash = await requireStoreHash(formData);
  const themePreset = String(formData.get("themePreset") || "");
  const seoEnabled = formData.get("seoEnabled") === "on";

  if (!isThemePreset(themePreset)) {
    throw new Error("Invalid theme preset");
  }

  await applyStorefrontConfig({ storeHash, themePreset, seoEnabled });
  revalidatePath("/");
}

export async function repairScriptsAction(formData: FormData) {
  const storeHash = await requireStoreHash(formData);
  const themePreset = String(formData.get("themePreset") || "editorial");
  const seoEnabled = formData.get("seoEnabled") === "on";

  await applyStorefrontConfig({
    storeHash,
    themePreset: isThemePreset(themePreset) ? themePreset : "editorial",
    seoEnabled,
  });
  revalidatePath("/");
}
