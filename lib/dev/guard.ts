import { notFound } from "next/navigation";

export function assertLocalDev(): void {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }
}

export function isLocalDev(): boolean {
  return process.env.NODE_ENV === "development";
}
