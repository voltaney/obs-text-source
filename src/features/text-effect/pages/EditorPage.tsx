import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import { ColorWithAlphaField } from "../components/ColorWithAlphaField";
import { TextEffectRenderer } from "../components/TextEffectRenderer";
import {
  DEFAULT_CONFIG,
  FONT_FAMILY_OPTIONS,
  FONT_WEIGHT_OPTIONS,
  OBS_CSS_VARIABLES_EXAMPLE,
  PREVIEW_BACKGROUND_OPTIONS,
  PREVIEW_SIZE_OPTIONS,
} from "../model/constants";
import {
  encodeConfig,
  parseConfigFromPastedRenderUrl,
  sanitizeConfig,
} from "../model/configCodec";
import type {
  AnimationPreset,
  HorizontalAlign,
  PreviewBackground,
  PreviewSize,
  ScrollDirection,
  SlideDirection,
  TextEffectConfig,
  VerticalAlign,
} from "../model/types";

export function EditorPage(): ReactElement {
  const [config, setConfig] = useState<TextEffectConfig>(DEFAULT_CONFIG);
  const [copied, setCopied] = useState(false);
  const [previewSize, setPreviewSize] = useState<PreviewSize>("1920x1080");
  const [previewBackground, setPreviewBackground] =
    useState<PreviewBackground>("checker");
  const [importSourceUrl, setImportSourceUrl] = useState("");
  const [isCssExampleModalOpen, setIsCssExampleModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: "ok" | "error";
    message: string;
  } | null>(null);

  const renderUrl = useMemo(() => {
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("mode", "render");
    url.searchParams.set("cfg", encodeConfig(config));
    return url.toString();
  }, [config]);

  const selectedPreviewSize =
    PREVIEW_SIZE_OPTIONS.find((option) => option.id === previewSize) ??
    PREVIEW_SIZE_OPTIONS[0];

  const setByPath = (path: string, value: unknown) => {
    const keys = path.split(".");
    const update = (
      target: Record<string, unknown>,
      index: number,
    ): Record<string, unknown> => {
      const key = keys[index];
      if (index === keys.length - 1) {
        return {
          ...target,
          [key]: value,
        };
      }

      const child = target[key];
      const childObject =
        child && typeof child === "object"
          ? (child as Record<string, unknown>)
          : {};
      return {
        ...target,
        [key]: update(childObject, index + 1),
      };
    };

    setConfig((prev) =>
      sanitizeConfig(update(prev as unknown as Record<string, unknown>, 0)),
    );
  };

  const setNumber = (path: string, value: number) => setByPath(path, value);
  const setString = (path: string, value: string) => setByPath(path, value);
  const setBoolean = (path: string, value: boolean) => setByPath(path, value);

  const copyUrl = async () => {
    await navigator.clipboard.writeText(renderUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const importFromRenderUrl = () => {
    const imported = parseConfigFromPastedRenderUrl(importSourceUrl);
    if (!imported) {
      setImportStatus({
        type: "error",
        message:
          "URLの解析に失敗しました。mode=render&cfg=... のURLを貼り付けてください。",
      });
      return;
    }

    setConfig(imported);
    setImportStatus({ type: "ok", message: "設定を読み込みました。" });
  };

  useEffect(() => {
    if (!isCssExampleModalOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCssExampleModalOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isCssExampleModalOpen]);

  return (
    <main className="editor-page">
      <h1>テキストエフェクト URL 生成</h1>
      <p className="description">
        OBS Browser Source向けの透過テキストエフェクトURLを生成します。
      </p>

      <div className="editor-layout">
        <div className="editor-controls">
          <section className="panel">
            <h2>テキスト</h2>
            <label>
              表示文字
              <textarea
                value={config.text}
                onChange={(event) => setString("text", event.target.value)}
                rows={4}
              />
            </label>
            <div className="grid two">
              <ColorWithAlphaField
                label="文字色"
                color={config.color}
                opacity={config.colorOpacity}
                onColorChange={(value) => setString("color", value)}
                onOpacityChange={(value) => setNumber("colorOpacity", value)}
              />
              <ColorWithAlphaField
                label="背景色"
                color={config.backgroundColor}
                opacity={config.backgroundOpacity}
                onColorChange={(value) => setString("backgroundColor", value)}
                onOpacityChange={(value) =>
                  setNumber("backgroundOpacity", value)
                }
              />
              <label>
                フォント
                <select
                  value={config.fontFamily}
                  onChange={(event) =>
                    setString("fontFamily", event.target.value)
                  }
                >
                  <optgroup label="日本語対応フォント">
                    {FONT_FAMILY_OPTIONS.filter(
                      (option) => option.language === "ja",
                    ).map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        style={{ fontFamily: option.value }}
                      >
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="英語向けフォント">
                    {FONT_FAMILY_OPTIONS.filter(
                      (option) => option.language === "en",
                    ).map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        style={{ fontFamily: option.value }}
                      >
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </label>
              <label>
                フォントサイズ
                <input
                  type="number"
                  value={config.fontSize}
                  min={8}
                  max={320}
                  onChange={(event) =>
                    setNumber("fontSize", Number(event.target.value))
                  }
                />
              </label>
              <label>
                フォント太さ
                <select
                  value={config.fontWeight}
                  onChange={(event) =>
                    setNumber("fontWeight", Number(event.target.value))
                  }
                >
                  {FONT_WEIGHT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                文字間隔
                <input
                  type="number"
                  value={config.letterSpacing}
                  min={-12}
                  max={30}
                  step={0.1}
                  onChange={(event) =>
                    setNumber("letterSpacing", Number(event.target.value))
                  }
                />
              </label>
              <label>
                縁取り幅
                <input
                  type="number"
                  value={config.strokeWidth}
                  min={0}
                  max={30}
                  step={0.5}
                  onChange={(event) =>
                    setNumber("strokeWidth", Number(event.target.value))
                  }
                />
              </label>
              <ColorWithAlphaField
                label="縁取り色"
                color={config.strokeColor}
                opacity={config.strokeOpacity}
                onColorChange={(value) => setString("strokeColor", value)}
                onOpacityChange={(value) => setNumber("strokeOpacity", value)}
              />
              <label>
                横位置
                <select
                  value={config.horizontalAlign}
                  onChange={(event) =>
                    setString(
                      "horizontalAlign",
                      event.target.value as HorizontalAlign,
                    )
                  }
                >
                  <option value="left">左</option>
                  <option value="center">中央</option>
                  <option value="right">右</option>
                </select>
              </label>
              <label>
                縦位置
                <select
                  value={config.verticalAlign}
                  onChange={(event) =>
                    setString(
                      "verticalAlign",
                      event.target.value as VerticalAlign,
                    )
                  }
                >
                  <option value="top">上</option>
                  <option value="center">中央</option>
                  <option value="bottom">下</option>
                </select>
              </label>
              <label>
                余白X
                <input
                  type="number"
                  value={config.paddingX}
                  min={0}
                  max={400}
                  step={1}
                  onChange={(event) =>
                    setNumber("paddingX", Number(event.target.value))
                  }
                />
              </label>
              <label>
                余白Y
                <input
                  type="number"
                  value={config.paddingY}
                  min={0}
                  max={400}
                  step={1}
                  onChange={(event) =>
                    setNumber("paddingY", Number(event.target.value))
                  }
                />
              </label>
            </div>
          </section>

          <section className="panel">
            <h2>シャドウ</h2>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={config.shadow.enabled}
                onChange={(event) =>
                  setBoolean("shadow.enabled", event.target.checked)
                }
              />
              シャドウを有効化
            </label>
            <div className="grid two">
              <label>
                オフセットX
                <input
                  type="number"
                  value={config.shadow.x}
                  min={-400}
                  max={400}
                  step={1}
                  onChange={(event) =>
                    setNumber("shadow.x", Number(event.target.value))
                  }
                />
              </label>
              <label>
                オフセットY
                <input
                  type="number"
                  value={config.shadow.y}
                  min={-400}
                  max={400}
                  step={1}
                  onChange={(event) =>
                    setNumber("shadow.y", Number(event.target.value))
                  }
                />
              </label>
              <label>
                ぼかし
                <input
                  type="number"
                  value={config.shadow.blur}
                  min={0}
                  max={400}
                  step={1}
                  onChange={(event) =>
                    setNumber("shadow.blur", Number(event.target.value))
                  }
                />
              </label>
              <label>
                広がり
                <input
                  type="number"
                  value={config.shadow.spread}
                  min={-200}
                  max={200}
                  step={1}
                  onChange={(event) =>
                    setNumber("shadow.spread", Number(event.target.value))
                  }
                />
              </label>
              <ColorWithAlphaField
                label="影色"
                color={config.shadow.color}
                opacity={config.shadow.opacity}
                onColorChange={(value) => setString("shadow.color", value)}
                onOpacityChange={(value) => setNumber("shadow.opacity", value)}
              />
            </div>
          </section>

          <section className="panel">
            <h2>アニメーション</h2>
            <div className="grid two">
              <label>
                プリセット
                <select
                  value={config.animation.preset}
                  onChange={(event) =>
                    setString(
                      "animation.preset",
                      event.target.value as AnimationPreset,
                    )
                  }
                >
                  <option value="none">なし</option>
                  <option value="fade">フェード</option>
                  <option value="pulse">パルス</option>
                  <option value="slide">スライド</option>
                </select>
              </label>
              <label>
                時間 (秒)
                <input
                  type="number"
                  value={config.animation.duration}
                  min={0.1}
                  max={120}
                  step={0.1}
                  onChange={(event) =>
                    setNumber("animation.duration", Number(event.target.value))
                  }
                />
              </label>
              <label>
                遅延 (秒)
                <input
                  type="number"
                  value={config.animation.delay}
                  min={0}
                  max={60}
                  step={0.1}
                  onChange={(event) =>
                    setNumber("animation.delay", Number(event.target.value))
                  }
                />
              </label>
              <label>
                繰り返し回数 (0=無限)
                <input
                  type="number"
                  value={config.animation.iterations}
                  min={0}
                  max={1000}
                  step={1}
                  onChange={(event) =>
                    setNumber(
                      "animation.iterations",
                      Number(event.target.value),
                    )
                  }
                />
              </label>
              <label>
                スライド方向
                <select
                  value={config.animation.slideDirection}
                  onChange={(event) =>
                    setString(
                      "animation.slideDirection",
                      event.target.value as SlideDirection,
                    )
                  }
                >
                  <option value="left">左</option>
                  <option value="right">右</option>
                  <option value="up">上</option>
                  <option value="down">下</option>
                </select>
              </label>
              <label>
                スライド距離 (px)
                <input
                  type="number"
                  value={config.animation.slideDistance}
                  min={0}
                  max={2000}
                  step={1}
                  onChange={(event) =>
                    setNumber(
                      "animation.slideDistance",
                      Number(event.target.value),
                    )
                  }
                />
              </label>
              <label>
                パルス拡大率
                <input
                  type="number"
                  value={config.animation.pulseScale}
                  min={1}
                  max={3}
                  step={0.01}
                  onChange={(event) =>
                    setNumber(
                      "animation.pulseScale",
                      Number(event.target.value),
                    )
                  }
                />
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={config.animation.alternate}
                  onChange={(event) =>
                    setBoolean("animation.alternate", event.target.checked)
                  }
                />
                交互再生
              </label>
            </div>
          </section>

          <section className="panel">
            <h2>スクロール</h2>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={config.scroll.enabled}
                onChange={(event) =>
                  setBoolean("scroll.enabled", event.target.checked)
                }
              />
              スクロールを有効化
            </label>
            <div className="grid two">
              <label>
                方向
                <select
                  value={config.scroll.direction}
                  onChange={(event) =>
                    setString(
                      "scroll.direction",
                      event.target.value as ScrollDirection,
                    )
                  }
                >
                  <option value="left">左</option>
                  <option value="right">右</option>
                  <option value="up">上</option>
                  <option value="down">下</option>
                </select>
              </label>
              <label>
                速度 (1-40)
                <input
                  type="number"
                  value={config.scroll.speed}
                  min={1}
                  max={40}
                  step={1}
                  onChange={(event) =>
                    setNumber("scroll.speed", Number(event.target.value))
                  }
                />
              </label>
              <label>
                間隔 (px)
                <input
                  type="number"
                  value={config.scroll.gap}
                  min={0}
                  max={600}
                  step={1}
                  onChange={(event) =>
                    setNumber("scroll.gap", Number(event.target.value))
                  }
                />
              </label>
            </div>
          </section>

          <section className="panel">
            <h2>点滅</h2>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={config.blink.enabled}
                onChange={(event) =>
                  setBoolean("blink.enabled", event.target.checked)
                }
              />
              点滅を有効化
            </label>
            <div className="grid two">
              <label>
                周期 (秒)
                <input
                  type="number"
                  value={config.blink.period}
                  min={0.1}
                  max={30}
                  step={0.1}
                  onChange={(event) =>
                    setNumber("blink.period", Number(event.target.value))
                  }
                />
              </label>
              <label>
                点灯率 (0.05-1.0)
                <input
                  type="number"
                  value={config.blink.dutyCycle}
                  min={0.05}
                  max={1}
                  step={0.05}
                  onChange={(event) =>
                    setNumber("blink.dutyCycle", Number(event.target.value))
                  }
                />
              </label>
            </div>
          </section>
        </div>

        <aside className="editor-preview-column">
          <section className="panel preview-panel">
            <h2>ライブプレビュー</h2>
            <div className="preview-toolbar">
              <label>
                解像度
                <select
                  value={previewSize}
                  onChange={(event) =>
                    setPreviewSize(event.target.value as PreviewSize)
                  }
                >
                  {PREVIEW_SIZE_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                背景
                <select
                  value={previewBackground}
                  onChange={(event) =>
                    setPreviewBackground(
                      event.target.value as PreviewBackground,
                    )
                  }
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
              style={{
                aspectRatio: `${selectedPreviewSize.width} / ${selectedPreviewSize.height}`,
              }}
            >
              <div className="preview-canvas">
                <TextEffectRenderer
                  config={config}
                  className="preview-render"
                />
              </div>
            </div>
          </section>

          <section className="panel">
            <h2>レンダーURL</h2>
            <textarea value={renderUrl} readOnly rows={4} />
            <div className="actions">
              <button type="button" onClick={copyUrl}>
                {copied ? "コピー済み" : "URLをコピー"}
              </button>
              <a href={renderUrl} target="_blank" rel="noreferrer">
                別タブで確認
              </a>
              <button
                type="button"
                onClick={() => setIsCssExampleModalOpen(true)}
              >
                CSS変数例
              </button>
            </div>
            <p className="hint">
              OBS側のカスタムCSS変数で `--te-text`
              を設定すると、URL指定より優先して文字列を上書きできます。
            </p>
            <label>
              既存のレンダーURLから設定を読み込む
              <textarea
                value={importSourceUrl}
                onChange={(event) => setImportSourceUrl(event.target.value)}
                placeholder="https://example.com/?mode=render&cfg=..."
                rows={3}
              />
            </label>
            <div className="actions">
              <button type="button" onClick={importFromRenderUrl}>
                URLから読み込む
              </button>
            </div>
            {importStatus && (
              <p
                className={`hint import-status ${importStatus.type === "error" ? "is-error" : "is-ok"}`}
              >
                {importStatus.message}
              </p>
            )}
          </section>
        </aside>
      </div>

      {isCssExampleModalOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setIsCssExampleModalOpen(false)}
        >
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="css-vars-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="css-vars-modal-title">OBS CSS変数の例</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsCssExampleModalOpen(false)}
              >
                閉じる
              </button>
            </div>
            <pre>{OBS_CSS_VARIABLES_EXAMPLE}</pre>
          </div>
        </div>
      )}
    </main>
  );
}

