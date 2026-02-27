import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactElement } from 'react'
import './App.css'

type AnimationPreset = 'none' | 'fade' | 'pulse' | 'slide'
type SlideDirection = 'left' | 'right' | 'up' | 'down'
type ScrollDirection = 'left' | 'right' | 'up' | 'down'
type HorizontalAlign = 'left' | 'center' | 'right'
type VerticalAlign = 'top' | 'center' | 'bottom'
type PreviewSize = '1920x1080' | '1280x720' | '1080x1920'
type PreviewBackground = 'checker' | 'dark' | 'light' | 'transparent'

interface TextEffectConfig {
  text: string
  color: string
  fontSize: number
  fontWeight: number
  letterSpacing: number
  strokeWidth: number
  strokeColor: string
  backgroundColor: string
  paddingX: number
  paddingY: number
  horizontalAlign: HorizontalAlign
  verticalAlign: VerticalAlign
  shadow: {
    enabled: boolean
    x: number
    y: number
    blur: number
    spread: number
    color: string
  }
  animation: {
    preset: AnimationPreset
    duration: number
    delay: number
    iterations: number
    alternate: boolean
    slideDirection: SlideDirection
    slideDistance: number
    pulseScale: number
  }
  scroll: {
    enabled: boolean
    direction: ScrollDirection
    speed: number
    gap: number
  }
  blink: {
    enabled: boolean
    period: number
    dutyCycle: number
  }
}

const DEFAULT_CONFIG: TextEffectConfig = {
  text: 'Sample Text',
  color: '#ffffff',
  fontSize: 72,
  fontWeight: 700,
  letterSpacing: 1,
  strokeWidth: 0,
  strokeColor: '#000000',
  backgroundColor: 'transparent',
  paddingX: 0,
  paddingY: 0,
  horizontalAlign: 'center',
  verticalAlign: 'center',
  shadow: {
    enabled: true,
    x: 2,
    y: 2,
    blur: 8,
    spread: 0,
    color: 'rgba(0, 0, 0, 0.7)',
  },
  animation: {
    preset: 'none',
    duration: 1.2,
    delay: 0,
    iterations: 1,
    alternate: false,
    slideDirection: 'left',
    slideDistance: 120,
    pulseScale: 1.12,
  },
  scroll: {
    enabled: false,
    direction: 'left',
    speed: 8,
    gap: 96,
  },
  blink: {
    enabled: false,
    period: 1,
    dutyCycle: 0.5,
  },
}

const BOOLEAN_TRUE_SET = new Set(['1', 'true', 'yes', 'on'])

const PREVIEW_SIZE_OPTIONS: ReadonlyArray<{
  id: PreviewSize
  label: string
  width: number
  height: number
}> = [
  { id: '1920x1080', label: '1920 x 1080', width: 1920, height: 1080 },
  { id: '1280x720', label: '1280 x 720', width: 1280, height: 720 },
  { id: '1080x1920', label: '1080 x 1920', width: 1080, height: 1920 },
]

const PREVIEW_BACKGROUND_OPTIONS: ReadonlyArray<{
  id: PreviewBackground
  label: string
}> = [
  { id: 'checker', label: 'Checker' },
  { id: 'dark', label: 'Dark' },
  { id: 'light', label: 'Light' },
  { id: 'transparent', label: 'Transparent' },
]

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) {
    return min
  }
  return Math.min(max, Math.max(min, value))
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'string') {
    return BOOLEAN_TRUE_SET.has(value.trim().toLowerCase())
  }
  return fallback
}

function parseNumber(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value === 'number') {
    return clamp(value, min, max)
  }
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? clamp(parsed, min, max) : fallback
  }
  return fallback
}

function parseString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback
}

function parseChoice<T extends string>(value: unknown, choices: readonly T[], fallback: T): T {
  return typeof value === 'string' && choices.includes(value as T) ? (value as T) : fallback
}

function sanitizeConfig(raw: unknown): TextEffectConfig {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const shadowSource = source.shadow && typeof source.shadow === 'object' ? (source.shadow as Record<string, unknown>) : {}
  const animationSource =
    source.animation && typeof source.animation === 'object' ? (source.animation as Record<string, unknown>) : {}
  const scrollSource = source.scroll && typeof source.scroll === 'object' ? (source.scroll as Record<string, unknown>) : {}
  const blinkSource = source.blink && typeof source.blink === 'object' ? (source.blink as Record<string, unknown>) : {}

  return {
    text: parseString(source.text, DEFAULT_CONFIG.text),
    color: parseString(source.color, DEFAULT_CONFIG.color),
    fontSize: parseNumber(source.fontSize, DEFAULT_CONFIG.fontSize, 8, 320),
    fontWeight: parseNumber(source.fontWeight, DEFAULT_CONFIG.fontWeight, 100, 900),
    letterSpacing: parseNumber(source.letterSpacing, DEFAULT_CONFIG.letterSpacing, -12, 30),
    strokeWidth: parseNumber(source.strokeWidth, DEFAULT_CONFIG.strokeWidth, 0, 30),
    strokeColor: parseString(source.strokeColor, DEFAULT_CONFIG.strokeColor),
    backgroundColor: parseString(source.backgroundColor, DEFAULT_CONFIG.backgroundColor),
    paddingX: parseNumber(source.paddingX, DEFAULT_CONFIG.paddingX, 0, 400),
    paddingY: parseNumber(source.paddingY, DEFAULT_CONFIG.paddingY, 0, 400),
    horizontalAlign: parseChoice(source.horizontalAlign, ['left', 'center', 'right'] as const, DEFAULT_CONFIG.horizontalAlign),
    verticalAlign: parseChoice(source.verticalAlign, ['top', 'center', 'bottom'] as const, DEFAULT_CONFIG.verticalAlign),
    shadow: {
      enabled: parseBoolean(shadowSource.enabled, DEFAULT_CONFIG.shadow.enabled),
      x: parseNumber(shadowSource.x, DEFAULT_CONFIG.shadow.x, -400, 400),
      y: parseNumber(shadowSource.y, DEFAULT_CONFIG.shadow.y, -400, 400),
      blur: parseNumber(shadowSource.blur, DEFAULT_CONFIG.shadow.blur, 0, 400),
      spread: parseNumber(shadowSource.spread, DEFAULT_CONFIG.shadow.spread, -200, 200),
      color: parseString(shadowSource.color, DEFAULT_CONFIG.shadow.color),
    },
    animation: {
      preset: parseChoice(animationSource.preset, ['none', 'fade', 'pulse', 'slide'] as const, DEFAULT_CONFIG.animation.preset),
      duration: parseNumber(animationSource.duration, DEFAULT_CONFIG.animation.duration, 0.1, 120),
      delay: parseNumber(animationSource.delay, DEFAULT_CONFIG.animation.delay, 0, 60),
      iterations: parseNumber(animationSource.iterations, DEFAULT_CONFIG.animation.iterations, 0, 1000),
      alternate: parseBoolean(animationSource.alternate, DEFAULT_CONFIG.animation.alternate),
      slideDirection: parseChoice(
        animationSource.slideDirection,
        ['left', 'right', 'up', 'down'] as const,
        DEFAULT_CONFIG.animation.slideDirection,
      ),
      slideDistance: parseNumber(animationSource.slideDistance, DEFAULT_CONFIG.animation.slideDistance, 0, 2000),
      pulseScale: parseNumber(animationSource.pulseScale, DEFAULT_CONFIG.animation.pulseScale, 1, 3),
    },
    scroll: {
      enabled: parseBoolean(scrollSource.enabled, DEFAULT_CONFIG.scroll.enabled),
      direction: parseChoice(scrollSource.direction, ['left', 'right', 'up', 'down'] as const, DEFAULT_CONFIG.scroll.direction),
      speed: parseNumber(scrollSource.speed, DEFAULT_CONFIG.scroll.speed, 1, 40),
      gap: parseNumber(scrollSource.gap, DEFAULT_CONFIG.scroll.gap, 0, 600),
    },
    blink: {
      enabled: parseBoolean(blinkSource.enabled, DEFAULT_CONFIG.blink.enabled),
      period: parseNumber(blinkSource.period, DEFAULT_CONFIG.blink.period, 0.1, 30),
      dutyCycle: parseNumber(blinkSource.dutyCycle, DEFAULT_CONFIG.blink.dutyCycle, 0.05, 1),
    },
  }
}

function encodeConfig(config: TextEffectConfig): string {
  const json = JSON.stringify(config)
  const bytes = new TextEncoder().encode(json)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function decodeConfig(cfg: string | null): TextEffectConfig {
  if (!cfg) {
    return DEFAULT_CONFIG
  }

  try {
    const normalized = cfg.replace(/-/g, '+').replace(/_/g, '/')
    const paddingLength = (4 - (normalized.length % 4)) % 4
    const padded = normalized + '='.repeat(paddingLength)
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    const parsed = JSON.parse(new TextDecoder().decode(bytes))
    return sanitizeConfig(parsed)
  } catch {
    return DEFAULT_CONFIG
  }
}

function stripQuotes(value: string): string {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function getSlideVector(direction: SlideDirection, distance: number): { x: number; y: number } {
  switch (direction) {
    case 'left':
      return { x: -distance, y: 0 }
    case 'right':
      return { x: distance, y: 0 }
    case 'up':
      return { x: 0, y: -distance }
    case 'down':
      return { x: 0, y: distance }
  }
}

function applyCssOverrides(base: TextEffectConfig): TextEffectConfig {
  const rootStyle = getComputedStyle(document.documentElement)

  const text = stripQuotes(rootStyle.getPropertyValue('--te-text'))
  const color = stripQuotes(rootStyle.getPropertyValue('--te-color'))
  const fontSize = stripQuotes(rootStyle.getPropertyValue('--te-font-size'))
  const fontWeight = stripQuotes(rootStyle.getPropertyValue('--te-font-weight'))
  const letterSpacing = stripQuotes(rootStyle.getPropertyValue('--te-letter-spacing'))
  const strokeWidth = stripQuotes(rootStyle.getPropertyValue('--te-stroke-width'))
  const strokeColor = stripQuotes(rootStyle.getPropertyValue('--te-stroke-color'))
  const backgroundColor = stripQuotes(rootStyle.getPropertyValue('--te-background-color'))
  const shadowEnabled = stripQuotes(rootStyle.getPropertyValue('--te-shadow-enabled'))
  const shadowX = stripQuotes(rootStyle.getPropertyValue('--te-shadow-x'))
  const shadowY = stripQuotes(rootStyle.getPropertyValue('--te-shadow-y'))
  const shadowBlur = stripQuotes(rootStyle.getPropertyValue('--te-shadow-blur'))
  const shadowSpread = stripQuotes(rootStyle.getPropertyValue('--te-shadow-spread'))
  const shadowColor = stripQuotes(rootStyle.getPropertyValue('--te-shadow-color'))
  const animationPreset = stripQuotes(rootStyle.getPropertyValue('--te-animation-preset'))
  const animationDuration = stripQuotes(rootStyle.getPropertyValue('--te-animation-duration'))
  const scrollEnabled = stripQuotes(rootStyle.getPropertyValue('--te-scroll-enabled'))
  const scrollDirection = stripQuotes(rootStyle.getPropertyValue('--te-scroll-direction'))
  const scrollSpeed = stripQuotes(rootStyle.getPropertyValue('--te-scroll-speed'))
  const blinkEnabled = stripQuotes(rootStyle.getPropertyValue('--te-blink-enabled'))
  const blinkPeriod = stripQuotes(rootStyle.getPropertyValue('--te-blink-period'))
  const blinkDutyCycle = stripQuotes(rootStyle.getPropertyValue('--te-blink-duty-cycle'))

  return sanitizeConfig({
    ...base,
    text: text || base.text,
    color: color || base.color,
    fontSize: fontSize || base.fontSize,
    fontWeight: fontWeight || base.fontWeight,
    letterSpacing: letterSpacing || base.letterSpacing,
    strokeWidth: strokeWidth || base.strokeWidth,
    strokeColor: strokeColor || base.strokeColor,
    backgroundColor: backgroundColor || base.backgroundColor,
    shadow: {
      ...base.shadow,
      enabled: shadowEnabled || base.shadow.enabled,
      x: shadowX || base.shadow.x,
      y: shadowY || base.shadow.y,
      blur: shadowBlur || base.shadow.blur,
      spread: shadowSpread || base.shadow.spread,
      color: shadowColor || base.shadow.color,
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
  })
}

function getRenderConfigFromLocation(search: string): TextEffectConfig {
  const params = new URLSearchParams(search)
  return decodeConfig(params.get('cfg'))
}

function isRenderMode(search: string): boolean {
  const params = new URLSearchParams(search)
  return params.get('mode') === 'render'
}

function EditorPage(): ReactElement {
  const [config, setConfig] = useState<TextEffectConfig>(DEFAULT_CONFIG)
  const [copied, setCopied] = useState(false)
  const [previewSize, setPreviewSize] = useState<PreviewSize>('1920x1080')
  const [previewBackground, setPreviewBackground] = useState<PreviewBackground>('checker')

  const renderUrl = useMemo(() => {
    const url = new URL(window.location.href)
    url.search = ''
    url.searchParams.set('mode', 'render')
    url.searchParams.set('cfg', encodeConfig(config))
    return url.toString()
  }, [config])

  const selectedPreviewSize =
    PREVIEW_SIZE_OPTIONS.find((option) => option.id === previewSize) ?? PREVIEW_SIZE_OPTIONS[0]

  const setByPath = (path: string, value: unknown) => {
    const keys = path.split('.')
    const update = (target: Record<string, unknown>, index: number): Record<string, unknown> => {
      const key = keys[index]
      if (index === keys.length - 1) {
        return {
          ...target,
          [key]: value,
        }
      }

      const child = target[key]
      const childObject = child && typeof child === 'object' ? (child as Record<string, unknown>) : {}
      return {
        ...target,
        [key]: update(childObject, index + 1),
      }
    }

    setConfig((prev) => sanitizeConfig(update(prev as unknown as Record<string, unknown>, 0)))
  }

  const setNumber = (path: string, value: number) => setByPath(path, value)
  const setString = (path: string, value: string) => setByPath(path, value)
  const setBoolean = (path: string, value: boolean) => setByPath(path, value)

  const copyUrl = async () => {
    await navigator.clipboard.writeText(renderUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <main className="editor-page">
      <h1>Text Effect URL Generator</h1>
      <p className="description">OBS Browser Source向けの透過テキストエフェクトURLを生成します。</p>

      <div className="editor-layout">
        <div className="editor-controls">
          <section className="panel">
            <h2>Text</h2>
            <label>
              表示文字
              <textarea value={config.text} onChange={(event) => setString('text', event.target.value)} rows={4} />
            </label>
            <div className="grid two">
              <label>
                文字色
                <input type="color" value={config.color} onChange={(event) => setString('color', event.target.value)} />
              </label>
              <label>
                背景色
                <input
                  type="text"
                  value={config.backgroundColor}
                  onChange={(event) => setString('backgroundColor', event.target.value)}
                />
              </label>
              <label>
                Font Size
                <input
                  type="number"
                  value={config.fontSize}
                  min={8}
                  max={320}
                  onChange={(event) => setNumber('fontSize', Number(event.target.value))}
                />
              </label>
              <label>
                Font Weight
                <input
                  type="number"
                  value={config.fontWeight}
                  min={100}
                  max={900}
                  step={100}
                  onChange={(event) => setNumber('fontWeight', Number(event.target.value))}
                />
              </label>
              <label>
                Letter Spacing
                <input
                  type="number"
                  value={config.letterSpacing}
                  min={-12}
                  max={30}
                  step={0.1}
                  onChange={(event) => setNumber('letterSpacing', Number(event.target.value))}
                />
              </label>
              <label>
                Stroke Width
                <input
                  type="number"
                  value={config.strokeWidth}
                  min={0}
                  max={30}
                  step={0.5}
                  onChange={(event) => setNumber('strokeWidth', Number(event.target.value))}
                />
              </label>
              <label>
                Stroke Color
                <input
                  type="text"
                  value={config.strokeColor}
                  onChange={(event) => setString('strokeColor', event.target.value)}
                />
              </label>
              <label>
                Horizontal Align
                <select
                  value={config.horizontalAlign}
                  onChange={(event) => setString('horizontalAlign', event.target.value as HorizontalAlign)}
                >
                  <option value="left">left</option>
                  <option value="center">center</option>
                  <option value="right">right</option>
                </select>
              </label>
              <label>
                Vertical Align
                <select
                  value={config.verticalAlign}
                  onChange={(event) => setString('verticalAlign', event.target.value as VerticalAlign)}
                >
                  <option value="top">top</option>
                  <option value="center">center</option>
                  <option value="bottom">bottom</option>
                </select>
              </label>
              <label>
                Padding X
                <input
                  type="number"
                  value={config.paddingX}
                  min={0}
                  max={400}
                  step={1}
                  onChange={(event) => setNumber('paddingX', Number(event.target.value))}
                />
              </label>
              <label>
                Padding Y
                <input
                  type="number"
                  value={config.paddingY}
                  min={0}
                  max={400}
                  step={1}
                  onChange={(event) => setNumber('paddingY', Number(event.target.value))}
                />
              </label>
            </div>
          </section>

          <section className="panel">
            <h2>Shadow</h2>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={config.shadow.enabled}
                onChange={(event) => setBoolean('shadow.enabled', event.target.checked)}
              />
              Shadowを有効化
            </label>
            <div className="grid two">
              <label>
                X
                <input
                  type="number"
                  value={config.shadow.x}
                  min={-400}
                  max={400}
                  step={1}
                  onChange={(event) => setNumber('shadow.x', Number(event.target.value))}
                />
              </label>
              <label>
                Y
                <input
                  type="number"
                  value={config.shadow.y}
                  min={-400}
                  max={400}
                  step={1}
                  onChange={(event) => setNumber('shadow.y', Number(event.target.value))}
                />
              </label>
              <label>
                Blur
                <input
                  type="number"
                  value={config.shadow.blur}
                  min={0}
                  max={400}
                  step={1}
                  onChange={(event) => setNumber('shadow.blur', Number(event.target.value))}
                />
              </label>
              <label>
                Spread
                <input
                  type="number"
                  value={config.shadow.spread}
                  min={-200}
                  max={200}
                  step={1}
                  onChange={(event) => setNumber('shadow.spread', Number(event.target.value))}
                />
              </label>
              <label>
                Color
                <input
                  type="text"
                  value={config.shadow.color}
                  onChange={(event) => setString('shadow.color', event.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="panel">
            <h2>Animation Preset</h2>
            <div className="grid two">
              <label>
                Preset
                <select
                  value={config.animation.preset}
                  onChange={(event) => setString('animation.preset', event.target.value as AnimationPreset)}
                >
                  <option value="none">none</option>
                  <option value="fade">fade</option>
                  <option value="pulse">pulse</option>
                  <option value="slide">slide</option>
                </select>
              </label>
              <label>
                Duration (s)
                <input
                  type="number"
                  value={config.animation.duration}
                  min={0.1}
                  max={120}
                  step={0.1}
                  onChange={(event) => setNumber('animation.duration', Number(event.target.value))}
                />
              </label>
              <label>
                Delay (s)
                <input
                  type="number"
                  value={config.animation.delay}
                  min={0}
                  max={60}
                  step={0.1}
                  onChange={(event) => setNumber('animation.delay', Number(event.target.value))}
                />
              </label>
              <label>
                Iterations (0 = infinite)
                <input
                  type="number"
                  value={config.animation.iterations}
                  min={0}
                  max={1000}
                  step={1}
                  onChange={(event) => setNumber('animation.iterations', Number(event.target.value))}
                />
              </label>
              <label>
                Slide Direction
                <select
                  value={config.animation.slideDirection}
                  onChange={(event) => setString('animation.slideDirection', event.target.value as SlideDirection)}
                >
                  <option value="left">left</option>
                  <option value="right">right</option>
                  <option value="up">up</option>
                  <option value="down">down</option>
                </select>
              </label>
              <label>
                Slide Distance (px)
                <input
                  type="number"
                  value={config.animation.slideDistance}
                  min={0}
                  max={2000}
                  step={1}
                  onChange={(event) => setNumber('animation.slideDistance', Number(event.target.value))}
                />
              </label>
              <label>
                Pulse Scale
                <input
                  type="number"
                  value={config.animation.pulseScale}
                  min={1}
                  max={3}
                  step={0.01}
                  onChange={(event) => setNumber('animation.pulseScale', Number(event.target.value))}
                />
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={config.animation.alternate}
                  onChange={(event) => setBoolean('animation.alternate', event.target.checked)}
                />
                Alternate
              </label>
            </div>
          </section>

          <section className="panel">
            <h2>Scroll</h2>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={config.scroll.enabled}
                onChange={(event) => setBoolean('scroll.enabled', event.target.checked)}
              />
              スクロールを有効化
            </label>
            <div className="grid two">
              <label>
                Direction
                <select
                  value={config.scroll.direction}
                  onChange={(event) => setString('scroll.direction', event.target.value as ScrollDirection)}
                >
                  <option value="left">left</option>
                  <option value="right">right</option>
                  <option value="up">up</option>
                  <option value="down">down</option>
                </select>
              </label>
              <label>
                Speed (1-40)
                <input
                  type="number"
                  value={config.scroll.speed}
                  min={1}
                  max={40}
                  step={1}
                  onChange={(event) => setNumber('scroll.speed', Number(event.target.value))}
                />
              </label>
              <label>
                Gap (px)
                <input
                  type="number"
                  value={config.scroll.gap}
                  min={0}
                  max={600}
                  step={1}
                  onChange={(event) => setNumber('scroll.gap', Number(event.target.value))}
                />
              </label>
            </div>
          </section>

          <section className="panel">
            <h2>Blink</h2>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={config.blink.enabled}
                onChange={(event) => setBoolean('blink.enabled', event.target.checked)}
              />
              点滅を有効化
            </label>
            <div className="grid two">
              <label>
                Period (s)
                <input
                  type="number"
                  value={config.blink.period}
                  min={0.1}
                  max={30}
                  step={0.1}
                  onChange={(event) => setNumber('blink.period', Number(event.target.value))}
                />
              </label>
              <label>
                Duty Cycle (0.05-1.0)
                <input
                  type="number"
                  value={config.blink.dutyCycle}
                  min={0.05}
                  max={1}
                  step={0.05}
                  onChange={(event) => setNumber('blink.dutyCycle', Number(event.target.value))}
                />
              </label>
            </div>
          </section>
        </div>

        <aside className="editor-preview-column">
          <section className="panel preview-panel">
            <h2>Live Preview</h2>
            <div className="preview-toolbar">
              <label>
                Size
                <select value={previewSize} onChange={(event) => setPreviewSize(event.target.value as PreviewSize)}>
                  {PREVIEW_SIZE_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Background
                <select
                  value={previewBackground}
                  onChange={(event) => setPreviewBackground(event.target.value as PreviewBackground)}
                >
                  {PREVIEW_BACKGROUND_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="preview-meta">
              {selectedPreviewSize.width} x {selectedPreviewSize.height}
            </p>
            <div
              className={`preview-stage preview-bg-${previewBackground}`}
              style={{ aspectRatio: `${selectedPreviewSize.width} / ${selectedPreviewSize.height}` }}
            >
              <div className="preview-canvas">
                <TextEffectRenderer config={config} className="preview-render" />
              </div>
            </div>
          </section>

          <section className="panel">
            <h2>Render URL</h2>
            <textarea value={renderUrl} readOnly rows={4} />
            <div className="actions">
              <button type="button" onClick={copyUrl}>
                {copied ? 'Copied' : 'Copy URL'}
              </button>
              <a href={renderUrl} target="_blank" rel="noreferrer">
                Preview Render
              </a>
            </div>
            <p className="hint">
              OBS側のカスタムCSS変数で `--te-text` を設定すると、URL指定より優先して文字列を上書きできます。
            </p>
          </section>

          <section className="panel">
            <h2>OBS CSS Variable Examples</h2>
            <pre>
{`--te-text: "Override from OBS";
--te-color: #ffcc00;
--te-font-size: 80;
--te-shadow-enabled: true;
--te-shadow-color: rgba(0, 0, 0, 0.8);
--te-animation-preset: pulse;
--te-scroll-enabled: true;
--te-scroll-direction: left;
--te-scroll-speed: 12;
--te-blink-enabled: true;`}
            </pre>
          </section>
        </aside>
      </div>
    </main>
  )
}

function TextEffectRenderer({ config, className }: { config: TextEffectConfig; className?: string }): ReactElement {
  const [blinkVisible, setBlinkVisible] = useState(true)

  useEffect(() => {
    if (!config.blink.enabled) {
      return
    }

    const periodMs = config.blink.period * 1000
    const onDurationMs = clamp(config.blink.dutyCycle * periodMs, 10, periodMs)

    let offTimeout: number | undefined
    const cycle = () => {
      setBlinkVisible(true)
      offTimeout = window.setTimeout(() => setBlinkVisible(false), onDurationMs)
    }

    cycle()
    const intervalId = window.setInterval(cycle, periodMs)

    return () => {
      window.clearInterval(intervalId)
      if (offTimeout !== undefined) {
        window.clearTimeout(offTimeout)
      }
    }
  }, [config.blink.enabled, config.blink.period, config.blink.dutyCycle])

  const effectiveBlinkVisible = config.blink.enabled ? blinkVisible : true

  const { animationName, customVars } = useMemo(() => {
    if (config.animation.preset === 'none') {
      return { animationName: undefined, customVars: {} as CSSProperties }
    }

    if (config.animation.preset === 'fade') {
      return { animationName: 'te-fade', customVars: {} as CSSProperties }
    }

    if (config.animation.preset === 'pulse') {
      return {
        animationName: 'te-pulse',
        customVars: {
          '--te-pulse-scale': String(config.animation.pulseScale),
        } as CSSProperties,
      }
    }

    const vector = getSlideVector(config.animation.slideDirection, config.animation.slideDistance)
    return {
      animationName: 'te-slide',
      customVars: {
        '--te-slide-x': `${vector.x}px`,
        '--te-slide-y': `${vector.y}px`,
      } as CSSProperties,
    }
  }, [
    config.animation.preset,
    config.animation.pulseScale,
    config.animation.slideDirection,
    config.animation.slideDistance,
  ])

  const baseTextStyle: CSSProperties = {
    ...customVars,
    color: config.color,
    fontSize: `${config.fontSize}px`,
    fontWeight: config.fontWeight,
    letterSpacing: `${config.letterSpacing}px`,
    WebkitTextStroke: `${config.strokeWidth}px ${config.strokeColor}`,
    textShadow: config.shadow.enabled
      ? `${config.shadow.x}px ${config.shadow.y}px ${config.shadow.blur}px ${config.shadow.spread}px ${config.shadow.color}`
      : 'none',
    backgroundColor: config.backgroundColor,
    padding: `${config.paddingY}px ${config.paddingX}px`,
    opacity: effectiveBlinkVisible ? 1 : 0,
    animationName,
    animationDuration: animationName ? `${config.animation.duration}s` : undefined,
    animationDelay: animationName ? `${config.animation.delay}s` : undefined,
    animationTimingFunction: animationName ? 'ease-in-out' : undefined,
    animationDirection: animationName && config.animation.alternate ? 'alternate' : undefined,
    animationIterationCount:
      animationName && config.animation.iterations === 0
        ? 'infinite'
        : animationName
          ? String(config.animation.iterations)
          : undefined,
    whiteSpace: 'pre-wrap',
  }

  const alignClass = `align-h-${config.horizontalAlign} align-v-${config.verticalAlign}`
  const containerClassName = className ? `render-page ${alignClass} ${className}` : `render-page ${alignClass}`

  if (!config.scroll.enabled) {
    return (
      <div className={containerClassName}>
        <div className="effect-text" style={baseTextStyle}>
          {config.text}
        </div>
      </div>
    )
  }

  const isHorizontal = config.scroll.direction === 'left' || config.scroll.direction === 'right'
  const duration = clamp(48 / config.scroll.speed, 1.2, 60)

  return (
    <div className={containerClassName}>
      <div className="scroll-viewport" data-axis={isHorizontal ? 'x' : 'y'}>
        <div
          className={`scroll-track dir-${config.scroll.direction}`}
          style={{
            animationDuration: `${duration}s`,
            gap: `${config.scroll.gap}px`,
          }}
        >
          <div className="effect-text" style={baseTextStyle}>
            {config.text}
          </div>
          <div className="effect-text" style={baseTextStyle} aria-hidden="true">
            {config.text}
          </div>
        </div>
      </div>
    </div>
  )
}

function RenderPage({ baseConfig }: { baseConfig: TextEffectConfig }): ReactElement {
  const [config, setConfig] = useState(() => applyCssOverrides(baseConfig))

  useEffect(() => {
    setConfig(applyCssOverrides(baseConfig))
  }, [baseConfig])

  return (
    <main className="render-root">
      <TextEffectRenderer config={config} />
    </main>
  )
}

function App() {
  const [search, setSearch] = useState(() => window.location.search)

  useEffect(() => {
    const onPopState = () => setSearch(window.location.search)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const renderMode = isRenderMode(search)

  if (renderMode) {
    return <RenderPage baseConfig={getRenderConfigFromLocation(search)} />
  }

  return <EditorPage />
}

export default App
