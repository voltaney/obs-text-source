import { DEFAULT_CONFIG, FONT_FAMILY_VALUES } from "./constants";
import { clamp, normalizeHexColor } from "./styleUtils";
import type {
  AnimationPreset,
  HorizontalAlign,
  ScrollDirection,
  SlideDirection,
  TextEffectConfig,
  VerticalAlign,
} from "./types";

const BOOLEAN_TRUE_SET = new Set(["1", "true", "yes", "on"]);

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return BOOLEAN_TRUE_SET.has(value.trim().toLowerCase());
  }
  return fallback;
}

function parseNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  if (typeof value === "number") {
    return clamp(value, min, max);
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? clamp(parsed, min, max) : fallback;
  }
  return fallback;
}

function parseString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function parseColor(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }
  return normalizeHexColor(value) ?? fallback;
}

function parseChoice<T extends string>(
  value: unknown,
  choices: readonly T[],
  fallback: T,
): T {
  return typeof value === "string" && choices.includes(value as T)
    ? (value as T)
    : fallback;
}

export function sanitizeConfig(raw: unknown): TextEffectConfig {
  const source =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const shadowSource =
    source.shadow && typeof source.shadow === "object"
      ? (source.shadow as Record<string, unknown>)
      : {};
  const animationSource =
    source.animation && typeof source.animation === "object"
      ? (source.animation as Record<string, unknown>)
      : {};
  const scrollSource =
    source.scroll && typeof source.scroll === "object"
      ? (source.scroll as Record<string, unknown>)
      : {};
  const blinkSource =
    source.blink && typeof source.blink === "object"
      ? (source.blink as Record<string, unknown>)
      : {};

  return {
    text: parseString(source.text, DEFAULT_CONFIG.text),
    fontFamily: parseChoice(
      source.fontFamily,
      FONT_FAMILY_VALUES,
      DEFAULT_CONFIG.fontFamily,
    ),
    color: parseColor(source.color, DEFAULT_CONFIG.color),
    colorOpacity: parseNumber(
      source.colorOpacity,
      DEFAULT_CONFIG.colorOpacity,
      0,
      1,
    ),
    fontSize: parseNumber(source.fontSize, DEFAULT_CONFIG.fontSize, 8, 320),
    fontWeight: parseNumber(
      source.fontWeight,
      DEFAULT_CONFIG.fontWeight,
      100,
      900,
    ),
    letterSpacing: parseNumber(
      source.letterSpacing,
      DEFAULT_CONFIG.letterSpacing,
      -12,
      30,
    ),
    strokeWidth: parseNumber(source.strokeWidth, DEFAULT_CONFIG.strokeWidth, 0, 30),
    strokeColor: parseColor(source.strokeColor, DEFAULT_CONFIG.strokeColor),
    strokeOpacity: parseNumber(
      source.strokeOpacity,
      DEFAULT_CONFIG.strokeOpacity,
      0,
      1,
    ),
    backgroundColor: parseColor(source.backgroundColor, DEFAULT_CONFIG.backgroundColor),
    backgroundOpacity: parseNumber(
      source.backgroundOpacity,
      DEFAULT_CONFIG.backgroundOpacity,
      0,
      1,
    ),
    paddingX: parseNumber(source.paddingX, DEFAULT_CONFIG.paddingX, 0, 400),
    paddingY: parseNumber(source.paddingY, DEFAULT_CONFIG.paddingY, 0, 400),
    horizontalAlign: parseChoice(
      source.horizontalAlign,
      ["left", "center", "right"] as const,
      DEFAULT_CONFIG.horizontalAlign,
    ),
    verticalAlign: parseChoice(
      source.verticalAlign,
      ["top", "center", "bottom"] as const,
      DEFAULT_CONFIG.verticalAlign,
    ),
    shadow: {
      enabled: parseBoolean(shadowSource.enabled, DEFAULT_CONFIG.shadow.enabled),
      x: parseNumber(shadowSource.x, DEFAULT_CONFIG.shadow.x, -400, 400),
      y: parseNumber(shadowSource.y, DEFAULT_CONFIG.shadow.y, -400, 400),
      blur: parseNumber(shadowSource.blur, DEFAULT_CONFIG.shadow.blur, 0, 400),
      spread: parseNumber(shadowSource.spread, DEFAULT_CONFIG.shadow.spread, -200, 200),
      color: parseColor(shadowSource.color, DEFAULT_CONFIG.shadow.color),
      opacity: parseNumber(shadowSource.opacity, DEFAULT_CONFIG.shadow.opacity, 0, 1),
    },
    animation: {
      preset: parseChoice(
        animationSource.preset,
        ["none", "fade", "pulse", "slide"] as const,
        DEFAULT_CONFIG.animation.preset,
      ),
      duration: parseNumber(
        animationSource.duration,
        DEFAULT_CONFIG.animation.duration,
        0.1,
        120,
      ),
      delay: parseNumber(animationSource.delay, DEFAULT_CONFIG.animation.delay, 0, 60),
      iterations: parseNumber(
        animationSource.iterations,
        DEFAULT_CONFIG.animation.iterations,
        0,
        1000,
      ),
      alternate: parseBoolean(
        animationSource.alternate,
        DEFAULT_CONFIG.animation.alternate,
      ),
      slideDirection: parseChoice(
        animationSource.slideDirection,
        ["left", "right", "up", "down"] as const,
        DEFAULT_CONFIG.animation.slideDirection,
      ),
      slideDistance: parseNumber(
        animationSource.slideDistance,
        DEFAULT_CONFIG.animation.slideDistance,
        0,
        2000,
      ),
      pulseScale: parseNumber(
        animationSource.pulseScale,
        DEFAULT_CONFIG.animation.pulseScale,
        1,
        3,
      ),
    },
    scroll: {
      enabled: parseBoolean(scrollSource.enabled, DEFAULT_CONFIG.scroll.enabled),
      direction: parseChoice(
        scrollSource.direction,
        ["left", "right", "up", "down"] as const,
        DEFAULT_CONFIG.scroll.direction,
      ),
      speed: parseNumber(scrollSource.speed, DEFAULT_CONFIG.scroll.speed, 1, 40),
      gap: parseNumber(scrollSource.gap, DEFAULT_CONFIG.scroll.gap, 0, 600),
    },
    blink: {
      enabled: parseBoolean(blinkSource.enabled, DEFAULT_CONFIG.blink.enabled),
      period: parseNumber(blinkSource.period, DEFAULT_CONFIG.blink.period, 0.1, 30),
      dutyCycle: parseNumber(
        blinkSource.dutyCycle,
        DEFAULT_CONFIG.blink.dutyCycle,
        0.05,
        1,
      ),
    },
  };
}

export function encodeConfig(config: TextEffectConfig): string {
  const json = JSON.stringify(config);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function tryDecodeConfigValue(cfg: string): TextEffectConfig | undefined {
  try {
    const normalized = cfg.replace(/-/g, "+").replace(/_/g, "/");
    const paddingLength = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + "=".repeat(paddingLength);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    return sanitizeConfig(parsed);
  } catch {
    return undefined;
  }
}

export function decodeConfig(cfg: string | null): TextEffectConfig {
  if (!cfg) {
    return DEFAULT_CONFIG;
  }

  return tryDecodeConfigValue(cfg) ?? DEFAULT_CONFIG;
}

export function parseConfigFromPastedRenderUrl(
  rawInput: string,
): TextEffectConfig | undefined {
  const trimmed = rawInput.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  const candidates: string[] = [];

  try {
    const parsedUrl = new URL(trimmed, window.location.origin);
    const cfg = parsedUrl.searchParams.get("cfg");
    if (cfg) {
      candidates.push(cfg);
    }
  } catch {
    // no-op
  }

  const params = new URLSearchParams(
    trimmed.startsWith("?") ? trimmed.slice(1) : trimmed,
  );
  const cfgFromParams = params.get("cfg");
  if (cfgFromParams) {
    candidates.push(cfgFromParams);
  }

  candidates.push(trimmed);

  for (const candidate of candidates) {
    const decoded = tryDecodeConfigValue(candidate);
    if (decoded) {
      return decoded;
    }
  }

  return undefined;
}

export function getRenderConfigFromLocation(search: string): TextEffectConfig {
  const params = new URLSearchParams(search);
  return decodeConfig(params.get("cfg"));
}

export function isRenderMode(search: string): boolean {
  const params = new URLSearchParams(search);
  return params.get("mode") === "render";
}

export type {
  AnimationPreset,
  HorizontalAlign,
  ScrollDirection,
  SlideDirection,
  VerticalAlign,
};
