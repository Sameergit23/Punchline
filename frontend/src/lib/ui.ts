import type { CSSProperties } from "react";

/** Inline style for the `.tilt` class. */
export function tilt(deg: number): CSSProperties {
  return { "--tilt": `${deg}deg` } as CSSProperties;
}

export const GENERATOR_INPUT_ID = "situation";

/** Scroll the hero generator into view and put the cursor in it. */
export function focusGenerator() {
  const input = document.getElementById(GENERATOR_INPUT_ID);
  if (!input) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  input.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  input.focus({ preventScroll: true });
}

const DEVANAGARI = /[\u0900-\u097F]/;

export function isDevanagari(text: string) {
  return DEVANAGARI.test(text);
}
