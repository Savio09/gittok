export interface AppSettings {
  autoplayVoiceover: boolean;
  backgroundMusic: boolean;
  slideDurationMultiplier: number;
  autoLoop: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  autoplayVoiceover: true,
  backgroundMusic: false,
  slideDurationMultiplier: 1,
  autoLoop: true,
};

export function loadAppSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  try {
    const raw = localStorage.getItem("gittok-settings");
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

