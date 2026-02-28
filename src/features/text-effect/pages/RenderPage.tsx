import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { TextEffectRenderer } from "../components/TextEffectRenderer";
import { applyCssOverrides } from "../model/cssOverrides";
import type { TextEffectConfig } from "../model/types";

export function RenderPage({
  baseConfig,
}: {
  baseConfig: TextEffectConfig;
}): ReactElement {
  const [config, setConfig] = useState(() => applyCssOverrides(baseConfig));

  useEffect(() => {
    const updateWithCssOverrides = () => {
      setConfig(applyCssOverrides(baseConfig));
    };

    let timeoutId: number | undefined;
    const scheduleSingleUpdate = () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(updateWithCssOverrides, 0);
    };

    if (document.readyState === "complete") {
      scheduleSingleUpdate();
      return () => {
        if (timeoutId !== undefined) {
          window.clearTimeout(timeoutId);
        }
      };
    }

    const onLoad = () => scheduleSingleUpdate();
    window.addEventListener("load", onLoad, { once: true });

    return () => {
      window.removeEventListener("load", onLoad);
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [baseConfig]);

  return (
    <main className="render-root">
      <TextEffectRenderer config={config} />
    </main>
  );
}
