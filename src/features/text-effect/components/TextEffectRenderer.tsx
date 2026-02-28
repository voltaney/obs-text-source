import type { CSSProperties, ReactElement } from "react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  buildTextShadow,
  clamp,
  getSlideVector,
  hexToRgba,
} from "../model/styleUtils";
import type { TextEffectConfig } from "../model/types";

export function TextEffectRenderer({
  config,
  className,
}: {
  config: TextEffectConfig;
  className?: string;
}): ReactElement {
  const [blinkVisible, setBlinkVisible] = useState(true);
  const scrollMeasureRef = useRef<HTMLDivElement | null>(null);
  const scrollViewportRef = useRef<HTMLDivElement | null>(null);
  const [scrollMetrics, setScrollMetrics] = useState({
    distance: 1,
    repeatCount: 2,
  });
  const isHorizontal =
    config.scroll.direction === "left" || config.scroll.direction === "right";

  useEffect(() => {
    if (!config.blink.enabled) {
      return;
    }

    const periodMs = config.blink.period * 1000;
    const onDurationMs = clamp(config.blink.dutyCycle * periodMs, 10, periodMs);

    let offTimeout: number | undefined;
    const cycle = () => {
      setBlinkVisible(true);
      offTimeout = window.setTimeout(() => setBlinkVisible(false), onDurationMs);
    };

    cycle();
    const intervalId = window.setInterval(cycle, periodMs);

    return () => {
      window.clearInterval(intervalId);
      if (offTimeout !== undefined) {
        window.clearTimeout(offTimeout);
      }
    };
  }, [config.blink.enabled, config.blink.period, config.blink.dutyCycle]);

  useLayoutEffect(() => {
    if (!config.scroll.enabled) {
      return;
    }

    const measure = () => {
      const measureNode = scrollMeasureRef.current;
      const viewportNode = scrollViewportRef.current;
      if (!measureNode || !viewportNode) {
        return;
      }

      const contentRect = measureNode.getBoundingClientRect();
      const viewportRect = viewportNode.getBoundingClientRect();
      const contentSize = isHorizontal ? contentRect.width : contentRect.height;
      const viewportSize = isHorizontal ? viewportRect.width : viewportRect.height;
      const distance = Math.max(1, Math.ceil(contentSize + config.scroll.gap));
      const repeatCount = Math.max(2, Math.ceil(viewportSize / distance) + 2);

      setScrollMetrics((prev) => {
        if (prev.distance === distance && prev.repeatCount === repeatCount) {
          return prev;
        }
        return { distance, repeatCount };
      });
    };

    measure();
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : undefined;
    if (observer && scrollMeasureRef.current && scrollViewportRef.current) {
      observer.observe(scrollMeasureRef.current);
      observer.observe(scrollViewportRef.current);
    }
    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
  }, [
    config.scroll.enabled,
    config.scroll.gap,
    config.text,
    config.fontSize,
    config.fontWeight,
    config.letterSpacing,
    config.strokeWidth,
    config.paddingX,
    config.paddingY,
    isHorizontal,
  ]);

  const effectiveBlinkVisible = config.blink.enabled ? blinkVisible : true;

  const { animationName, customVars } = useMemo(() => {
    if (config.animation.preset === "none") {
      return { animationName: undefined, customVars: {} as CSSProperties };
    }

    if (config.animation.preset === "fade") {
      return { animationName: "te-fade", customVars: {} as CSSProperties };
    }

    if (config.animation.preset === "pulse") {
      return {
        animationName: "te-pulse",
        customVars: {
          "--te-pulse-scale": String(config.animation.pulseScale),
        } as CSSProperties,
      };
    }

    const vector = getSlideVector(
      config.animation.slideDirection,
      config.animation.slideDistance,
    );
    return {
      animationName: "te-slide",
      customVars: {
        "--te-slide-x": `${vector.x}px`,
        "--te-slide-y": `${vector.y}px`,
      } as CSSProperties,
    };
  }, [
    config.animation.preset,
    config.animation.pulseScale,
    config.animation.slideDirection,
    config.animation.slideDistance,
  ]);

  const baseTextStyle: CSSProperties = {
    ...customVars,
    color: hexToRgba(config.color, config.colorOpacity),
    fontFamily: config.fontFamily,
    fontSize: `${config.fontSize}px`,
    fontWeight: config.fontWeight,
    letterSpacing: `${config.letterSpacing}px`,
    WebkitTextStroke: `${config.strokeWidth}px ${hexToRgba(config.strokeColor, config.strokeOpacity)}`,
    textShadow: buildTextShadow(config),
    backgroundColor: hexToRgba(config.backgroundColor, config.backgroundOpacity),
    padding: `${config.paddingY}px ${config.paddingX}px`,
    opacity: effectiveBlinkVisible ? 1 : 0,
    animationName,
    animationDuration: animationName ? `${config.animation.duration}s` : undefined,
    animationDelay: animationName ? `${config.animation.delay}s` : undefined,
    animationTimingFunction: animationName ? "ease-in-out" : undefined,
    animationDirection:
      animationName && config.animation.alternate ? "alternate" : undefined,
    animationIterationCount:
      animationName && config.animation.iterations === 0
        ? "infinite"
        : animationName
          ? String(config.animation.iterations)
          : undefined,
    whiteSpace: "pre",
    display: "inline-block",
  };

  const alignClass = `align-h-${config.horizontalAlign} align-v-${config.verticalAlign}`;
  const containerClassName = className
    ? `render-page ${alignClass} ${className}`
    : `render-page ${alignClass}`;

  if (!config.scroll.enabled) {
    return (
      <div className={containerClassName}>
        <div className="effect-text" style={baseTextStyle}>
          {config.text}
        </div>
      </div>
    );
  }

  const duration = clamp(48 / config.scroll.speed, 1.2, 60);
  const scrollTrackStyle: CSSProperties & Record<"--te-scroll-distance", string> = {
    animationDuration: `${duration}s`,
    gap: `${config.scroll.gap}px`,
    "--te-scroll-distance": `${scrollMetrics.distance}px`,
  };

  return (
    <div className={containerClassName}>
      <div
        className="scroll-viewport"
        data-axis={isHorizontal ? "x" : "y"}
        ref={scrollViewportRef}
      >
        <div
          className={`scroll-track dir-${config.scroll.direction}`}
          style={scrollTrackStyle}
        >
          {Array.from({ length: scrollMetrics.repeatCount }, (_, index) => (
            <div
              key={`scroll-item-${index}`}
              className="effect-text"
              style={baseTextStyle}
              ref={index === 0 ? scrollMeasureRef : undefined}
              aria-hidden={index === 0 ? undefined : true}
            >
              {config.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
