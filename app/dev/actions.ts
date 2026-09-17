"use server";

import { redirect } from "next/navigation";
import { isThemePreset } from "@/features/theme/presets";
import { isLocalDev } from "@/lib/dev/guard";

function mockQuery(formData: FormData, extra: Record<string, string> = {}) {
  if (!isLocalDev()) {
    throw new Error("Mock dashboard is only available in development");
  }

  const themePreset = String(formData.get("themePreset") || "editorial");
  const seoEnabled = formData.get("seoEnabled") === "on";
  const params = new URLSearchParams({
    capability: "stencil_blog",
    theme: isThemePreset(themePreset) ? themePreset : "editorial",
    seo: seoEnabled ? "1" : "0",
    ...extra,
  });
  redirect(`/dev?${params.toString()}`);
}

export async function mockSaveAction(formData: FormData) {
  mockQuery(formData);
}

export async function mockRepairAction(formData: FormData) {
  mockQuery(formData, { repaired: "1" });
}
