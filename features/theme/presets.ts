export const THEME_PRESETS = ["editorial", "minimal", "magazine"] as const;

export type ThemePreset = (typeof THEME_PRESETS)[number];

export const THEME_META: Record<
  ThemePreset,
  { label: string; summary: string }
> = {
  editorial: {
    label: "Showroom",
    summary: "Photogear homepage: studio grey, huge black titles, red NEW.",
  },
  minimal: {
    label: "Shop blog",
    summary: "Their current blog: white page, photo, title, excerpt, read more.",
  },
  magazine: {
    label: "Counter",
    summary: "Header charcoal #333, white type, red sale marks.",
  },
};

export function isThemePreset(value: string): value is ThemePreset {
  return (THEME_PRESETS as readonly string[]).includes(value);
}
