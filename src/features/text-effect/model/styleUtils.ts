import type { SlideDirection, TextEffectConfig } from "./types";

const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
}

export function normalizeHexColor(value: string): string | undefined {
  if (!HEX_COLOR_PATTERN.test(value)) {
    return undefined;
  }
  if (value.length === 4) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toLowerCase();
  }
  return value.toLowerCase();
}

export function hexToRgba(color: string, alpha: number): string {
  const normalized = normalizeHexColor(color) ?? "#000000";
  const r = Number.parseInt(normalized.slice(1, 3), 16);
  const g = Number.parseInt(normalized.slice(3, 5), 16);
  const b = Number.parseInt(normalized.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
}

export function buildTextShadow(config: TextEffectConfig): string {
  if (!config.shadow.enabled) {
    return "none";
  }

  const color = hexToRgba(config.shadow.color, config.shadow.opacity);
  const effectiveBlur = clamp(config.shadow.blur + config.shadow.spread, 0, 400);
  return `${config.shadow.x}px ${config.shadow.y}px ${effectiveBlur}px ${color}`;
}

export function getSlideVector(
  direction: SlideDirection,
  distance: number,
): { x: number; y: number } {
  switch (direction) {
    case "left":
      return { x: -distance, y: 0 };
    case "right":
      return { x: distance, y: 0 };
    case "up":
      return { x: 0, y: -distance };
    case "down":
      return { x: 0, y: distance };
  }
}
