import type { PreviewBackground, PreviewSize, TextEffectConfig } from "./types";

export const DEFAULT_CONFIG: TextEffectConfig = {
  text: "Sample Text",
  fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif",
  color: "#ffffff",
  colorOpacity: 1,
  fontSize: 72,
  fontWeight: 700,
  letterSpacing: 1,
  strokeWidth: 0,
  strokeColor: "#000000",
  strokeOpacity: 1,
  backgroundColor: "#000000",
  backgroundOpacity: 0,
  paddingX: 0,
  paddingY: 0,
  horizontalAlign: "center",
  verticalAlign: "center",
  shadow: {
    enabled: true,
    x: 2,
    y: 2,
    blur: 8,
    spread: 0,
    color: "#000000",
    opacity: 0.7,
  },
  animation: {
    preset: "none",
    duration: 1.2,
    delay: 0,
    iterations: 1,
    alternate: false,
    slideDirection: "left",
    slideDistance: 120,
    pulseScale: 1.12,
  },
  scroll: {
    enabled: false,
    direction: "left",
    speed: 8,
    gap: 96,
  },
  blink: {
    enabled: false,
    period: 1,
    dutyCycle: 0.5,
  },
};

export const FONT_FAMILY_OPTIONS: ReadonlyArray<{
  label: string;
  value: string;
  language: "ja" | "en";
}> = [
  {
    label: "日本語サンプル - Noto Sans JP",
    value: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif",
    language: "ja",
  },
  {
    label: "日本語サンプル - Yu Gothic",
    value: "'Yu Gothic', 'Hiragino Kaku Gothic ProN', sans-serif",
    language: "ja",
  },
  {
    label: "日本語サンプル - Meiryo",
    value: "'Meiryo', 'Hiragino Kaku Gothic ProN', sans-serif",
    language: "ja",
  },
  {
    label: "日本語サンプル - Noto Serif JP",
    value: "'Noto Serif JP', 'Hiragino Mincho ProN', serif",
    language: "ja",
  },
  {
    label: "日本語サンプル - BIZ UDPGothic",
    value: "'BIZ UDPGothic', 'Yu Gothic UI', sans-serif",
    language: "ja",
  },
  {
    label: "日本語サンプル - BIZ UDPMincho",
    value: "'BIZ UDPMincho', 'Yu Mincho', serif",
    language: "ja",
  },
  {
    label: "日本語サンプル - M PLUS 1p",
    value: "'M PLUS 1p', 'Hiragino Kaku Gothic ProN', sans-serif",
    language: "ja",
  },
  {
    label: "日本語サンプル - 游明朝",
    value: "'Yu Mincho', 'Hiragino Mincho ProN', serif",
    language: "ja",
  },
  {
    label: "日本語サンプル - UD デジタル 教科書体",
    value: "'UD Digi Kyokasho NK-R', 'Yu Gothic UI', sans-serif",
    language: "ja",
  },
  {
    label: "日本語サンプル - MS ゴシック",
    value: "'MS Gothic', 'Meiryo', sans-serif",
    language: "ja",
  },
  {
    label: "日本語サンプル - MS 明朝",
    value: "'MS Mincho', 'Yu Mincho', serif",
    language: "ja",
  },
  {
    label: "English Sample - Inter",
    value: "'Inter', 'Segoe UI', sans-serif",
    language: "en",
  },
  {
    label: "English Sample - Montserrat",
    value: "'Montserrat', 'Segoe UI', sans-serif",
    language: "en",
  },
  {
    label: "English Sample - Oswald",
    value: "'Oswald', 'Arial Narrow', sans-serif",
    language: "en",
  },
  {
    label: "English Sample - Georgia",
    value: "'Georgia', 'Times New Roman', serif",
    language: "en",
  },
  {
    label: "English Sample - Cascadia Mono",
    value: "'Cascadia Mono', 'Consolas', monospace",
    language: "en",
  },
  {
    label: "English Sample - Segoe UI",
    value: "'Segoe UI', 'Arial', sans-serif",
    language: "en",
  },
  {
    label: "English Sample - Arial",
    value: "'Arial', 'Helvetica Neue', sans-serif",
    language: "en",
  },
  {
    label: "English Sample - Verdana",
    value: "'Verdana', 'Geneva', sans-serif",
    language: "en",
  },
  {
    label: "English Sample - Tahoma",
    value: "'Tahoma', 'Verdana', sans-serif",
    language: "en",
  },
  {
    label: "English Sample - Trebuchet MS",
    value: "'Trebuchet MS', 'Verdana', sans-serif",
    language: "en",
  },
  {
    label: "English Sample - Times New Roman",
    value: "'Times New Roman', 'Georgia', serif",
    language: "en",
  },
  {
    label: "English Sample - Cambria",
    value: "'Cambria', 'Times New Roman', serif",
    language: "en",
  },
  {
    label: "English Sample - Palatino Linotype",
    value: "'Palatino Linotype', 'Book Antiqua', serif",
    language: "en",
  },
  {
    label: "English Sample - Courier New",
    value: "'Courier New', 'Consolas', monospace",
    language: "en",
  },
  {
    label: "English Sample - Consolas",
    value: "'Consolas', 'Cascadia Mono', monospace",
    language: "en",
  },
];

export const FONT_WEIGHT_OPTIONS: ReadonlyArray<{ value: number; label: string }> =
  [
    { value: 100, label: "100 Thin" },
    { value: 200, label: "200 Extra Light" },
    { value: 300, label: "300 Light" },
    { value: 400, label: "400 Regular" },
    { value: 500, label: "500 Medium" },
    { value: 600, label: "600 Semi Bold" },
    { value: 700, label: "700 Bold" },
    { value: 800, label: "800 Extra Bold" },
    { value: 900, label: "900 Black" },
  ];

export const FONT_FAMILY_VALUES = FONT_FAMILY_OPTIONS.map(
  (option) => option.value,
) as readonly string[];

export const PREVIEW_SIZE_OPTIONS: ReadonlyArray<{
  id: PreviewSize;
  label: string;
  width: number;
  height: number;
}> = [
  { id: "1920x1080", label: "1920 x 1080", width: 1920, height: 1080 },
  { id: "1280x720", label: "1280 x 720", width: 1280, height: 720 },
  { id: "1080x1920", label: "1080 x 1920", width: 1080, height: 1920 },
];

export const PREVIEW_BACKGROUND_OPTIONS: ReadonlyArray<{
  id: PreviewBackground;
  label: string;
}> = [
  { id: "checker", label: "チェック" },
  { id: "dark", label: "暗色" },
  { id: "light", label: "明色" },
  { id: "transparent", label: "透過" },
];

export const OBS_CSS_VARIABLES_EXAMPLE = `:root {
  --te-text: "Override from OBS";
  --te-color: #ffcc00;
  --te-color-opacity: 1;
  --te-font-family: "'Yu Gothic', sans-serif";
  --te-font-size: 80;
  --te-stroke-color: #000000;
  --te-stroke-opacity: 1;
  --te-background-color: #002244;
  --te-background-opacity: 0.4;
  --te-shadow-enabled: true;
  --te-shadow-color: #000000;
  --te-shadow-opacity: 0.8;
  --te-animation-preset: pulse;
  --te-scroll-enabled: true;
  --te-scroll-direction: left;
  --te-scroll-speed: 12;
  --te-blink-enabled: true;
}`;
