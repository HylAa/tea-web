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
    return cachedConfig;
  } catch (error) {
    console.error("Error loading text configuration:", error);
    throw error;
  }
}

// 提供一个重新加载配置的方法，用于在配置文件更改后刷新
export function clearConfigCache() {
  cachedConfig = null;
}
