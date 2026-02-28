import { sanitizeConfig } from "./configCodec";
import type { TextEffectConfig } from "./types";

function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function applyCssOverrides(base: TextEffectConfig): TextEffectConfig {
  const rootStyle = getComputedStyle(document.documentElement);
  const bodyStyle = document.body ? getComputedStyle(document.body) : undefined;
  const readCssVar = (name: string): string => {
    const rootValue = stripQuotes(rootStyle.getPropertyValue(name));
    if (rootValue.length > 0) {
      return rootValue;
    }
    if (!bodyStyle) {
      return "";
    }
    return stripQuotes(bodyStyle.getPropertyValue(name));
  };

  const text = readCssVar("--te-text");
  const fontFamily = readCssVar("--te-font-family");
  const color = readCssVar("--te-color");
  const colorOpacity = readCssVar("--te-color-opacity");
  const fontSize = readCssVar("--te-font-size");
  const fontWeight = readCssVar("--te-font-weight");
  const letterSpacing = readCssVar("--te-letter-spacing");
  const strokeWidth = readCssVar("--te-stroke-width");
  const strokeColor = readCssVar("--te-stroke-color");
  const strokeOpacity = readCssVar("--te-stroke-opacity");
  const backgroundColor = readCssVar("--te-background-color");
  const backgroundOpacity = readCssVar("--te-background-opacity");
  const shadowEnabled = readCssVar("--te-shadow-enabled");
  const shadowX = readCssVar("--te-shadow-x");
  const shadowY = readCssVar("--te-shadow-y");
  const shadowBlur = readCssVar("--te-shadow-blur");
  const shadowSpread = readCssVar("--te-shadow-spread");
  const shadowColor = readCssVar("--te-shadow-color");
  const shadowOpacity = readCssVar("--te-shadow-opacity");
  const animationPreset = readCssVar("--te-animation-preset");
  const animationDuration = readCssVar("--te-animation-duration");
  const scrollEnabled = readCssVar("--te-scroll-enabled");
  const scrollDirection = readCssVar("--te-scroll-direction");
  const scrollSpeed = readCssVar("--te-scroll-speed");
  const blinkEnabled = readCssVar("--te-blink-enabled");
  const blinkPeriod = readCssVar("--te-blink-period");
  const blinkDutyCycle = readCssVar("--te-blink-duty-cycle");

  return sanitizeConfig({
    ...base,
    text: text || base.text,
    fontFamily: fontFamily || base.fontFamily,
    color: color || base.color,
    colorOpacity: colorOpacity || base.colorOpacity,
    fontSize: fontSize || base.fontSize,
    fontWeight: fontWeight || base.fontWeight,
    letterSpacing: letterSpacing || base.letterSpacing,
    strokeWidth: strokeWidth || base.strokeWidth,
    strokeColor: strokeColor || base.strokeColor,
    strokeOpacity: strokeOpacity || base.strokeOpacity,
    backgroundColor: backgroundColor || base.backgroundColor,
    backgroundOpacity: backgroundOpacity || base.backgroundOpacity,
    shadow: {
      ...base.shadow,
      enabled: shadowEnabled || base.shadow.enabled,
      x: shadowX || base.shadow.x,
      y: shadowY || base.shadow.y,
      blur: shadowBlur || base.shadow.blur,
      spread: shadowSpread || base.shadow.spread,
      color: shadowColor || base.shadow.color,
      opacity: shadowOpacity || base.shadow.opacity,
    },
    animation: {
      ...base.animation,
      preset: animationPreset || base.animation.preset,
      duration: animationDuration || base.animation.duration,
    },
    scroll: {
      ...base.scroll,
      enabled: scrollEnabled || base.scroll.enabled,
      direction: scrollDirection || base.scroll.direction,
      speed: scrollSpeed || base.scroll.speed,
    },
    blink: {
      ...base.blink,
      enabled: blinkEnabled || base.blink.enabled,
      period: blinkPeriod || base.blink.period,
      dutyCycle: blinkDutyCycle || base.blink.dutyCycle,
    },
  });
}
