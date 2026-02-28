export type AnimationPreset = "none" | "fade" | "pulse" | "slide";
export type SlideDirection = "left" | "right" | "up" | "down";
export type ScrollDirection = "left" | "right" | "up" | "down";
export type HorizontalAlign = "left" | "center" | "right";
export type VerticalAlign = "top" | "center" | "bottom";
export type PreviewSize = "1920x1080" | "1280x720" | "1080x1920";
export type PreviewBackground = "checker" | "dark" | "light" | "transparent";

export interface TextEffectConfig {
  text: string;
  fontFamily: string;
  color: string;
  colorOpacity: number;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  strokeWidth: number;
  strokeColor: string;
  strokeOpacity: number;
  backgroundColor: string;
  backgroundOpacity: number;
  paddingX: number;
  paddingY: number;
  horizontalAlign: HorizontalAlign;
  verticalAlign: VerticalAlign;
  shadow: {
    enabled: boolean;
    x: number;
    y: number;
    blur: number;
    spread: number;
    color: string;
    opacity: number;
  };
  animation: {
    preset: AnimationPreset;
    duration: number;
    delay: number;
    iterations: number;
    alternate: boolean;
    slideDirection: SlideDirection;
    slideDistance: number;
    pulseScale: number;
  };
  scroll: {
    enabled: boolean;
    direction: ScrollDirection;
    speed: number;
    gap: number;
  };
  blink: {
    enabled: boolean;
    period: number;
    dutyCycle: number;
  };
}
