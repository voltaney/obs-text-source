import type { ReactElement } from "react";
import { hexToRgba } from "../model/styleUtils";

export function ColorWithAlphaField({
  label,
  color,
  opacity,
  onColorChange,
  onOpacityChange,
}: {
  label: string;
  color: string;
  opacity: number;
  onColorChange: (value: string) => void;
  onOpacityChange: (value: number) => void;
}): ReactElement {
  const rgbaValue = hexToRgba(color, opacity);
  return (
    <label>
      {label}
      <div className="color-control">
        <div className="color-picker-row">
          <input
            type="color"
            value={color}
            onChange={(event) => onColorChange(event.target.value)}
          />
          <span className="color-code">{color.toUpperCase()}</span>
        </div>
        <div className="alpha-row">
          <input
            type="range"
            value={opacity}
            min={0}
            max={1}
            step={0.01}
            onChange={(event) => onOpacityChange(Number(event.target.value))}
          />
          <span className="inline-value">{opacity.toFixed(2)}</span>
        </div>
        <span className="rgba-preview">{rgbaValue}</span>
      </div>
    </label>
  );
}
