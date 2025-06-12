import type { TextConfig } from "@/types/config";

let cachedConfig: TextConfig | null = null;

export async function loadTextConfig(): Promise<TextConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const response = await fetch("/config/text.json");
    if (!response.ok) {
      throw new Error("Failed to load text configuration");
    }
    cachedConfig = await response.json();
    return cachedConfig as TextConfig;
  } catch (error) {
    console.error("Error loading text configuration:", error);
    throw error;
  }
}