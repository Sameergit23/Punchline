import { useEffect, useRef, useState } from "react";
import { EXAMPLES, type Example } from "../data/examples";
import { ApiError, generateMeme, recaption, type Language, type Take } from "./api";

/** What the polaroid shows: a generated take, or an example before the first run. */
export interface DisplayTake {
  captions: string[];
  /** Template name for generated takes, the prompt for examples. */
  subtitle: string;
  imageUrl?: string;
  /** What /api/caption needs to re-render; drawn examples don't have one. */
  templateId?: string;
  language: Language;
  /** Written in 18+ mode. */
  adult?: boolean;
  art?: Example["art"];
}

const EXAMPLE_TAKES: DisplayTake[] = EXAMPLES.map((ex) => ({
  captions: ex.captions,
  subtitle: `Example: “${ex.prompt}”`,
  imageUrl: ex.render?.imageUrl,
  templateId: ex.render?.templateId,
  language: ex.hindi ? "hindi" : "hinglish",
  art: ex.art,
}));

const fromApi = (take: Take, language: Language, adult: boolean): DisplayTake => ({
  captions: take.captions,
  subtitle: take.template_name,
  imageUrl: take.image_url,
  templateId: take.template_id,
  language,
  adult,
});

/** How many recently shown templates to steer away from (two generations' worth). */
const RECENT = 6;

const friendly = (err: unknown) =>
  err instanceof ApiError ? err.message : "Something went wrong on our side. Try again?";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.cssText = "position:fixed;opacity:0";
    document.body.append(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

export function useGenerator() {
  const [situation, setSituation] = useState("");
  const [language, setLanguage] = useState<Language>("hinglish");
  const [adult, setAdult] = useState(false);
  const [takes, setTakes] = useState(EXAMPLE_TAKES);
  const [generated, setGenerated] = useState(false);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const recentTemplates = useRef(EXAMPLE_TAKES.flatMap((t) => (t.templateId ? [t.templateId] : [])));

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  function showToast(text: string, ok = true) {
    window.clearTimeout(toastTimer.current);
    setToast({ text, ok });
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }

  async function generate() {
    const text = situation.trim();
    if (!text || loading) return;
    setLoading(true);
    setError(null);
    setEditing(false);
    try {
      const { takes: fresh } = await generateMeme(text, language, recentTemplates.current, adult);
      fresh.forEach((take) => (new Image().src = take.image_url));
      recentTemplates.current = [...fresh.map((t) => t.template_id), ...recentTemplates.current].slice(0, RECENT);
      setTakes(fresh.map((take) => fromApi(take, language, adult)));
      setGenerated(true);
      setIndex(0);
    } catch (err) {
      setError(friendly(err));
    } finally {
      setLoading(false);
    }
  }

  function nextTake() {
    setEditing(false);
    setIndex((i) => (i + 1) % takes.length);
  }

  /** Re-render the current take with new captions. Throws ApiError for the edit panel. */
  async function saveCaptions(captions: string[]) {
    const take = takes[index];
    let update: Partial<DisplayTake> = { captions };
    if (take.templateId) {
      try {
        const { image_url } = await recaption(take.templateId, captions, take.language);
        update = { captions, imageUrl: image_url };
      } catch (err) {
        throw new ApiError(friendly(err));
      }
    }
    setTakes((all) => all.map((t, i) => (i === index ? { ...t, ...update } : t)));
    setEditing(false);
  }

  async function copyLink() {
    const url = takes[index].imageUrl;
    if (!url) {
      showToast("Make your own meme first, then copy its link", false);
      return;
    }
    if (await copyText(url)) showToast("Link copied");
    else showToast("Couldn't copy. Long-press the meme instead.", false);
  }

  return {
    situation,
    setSituation,
    language,
    setLanguage,
    adult,
    setAdult,
    takes,
    take: takes[index],
    index,
    generated,
    loading,
    error,
    editing,
    startEditing: () => setEditing(true),
    stopEditing: () => setEditing(false),
    generate,
    nextTake,
    saveCaptions,
    copyLink,
    toast,
  };
}

export type Generator = ReturnType<typeof useGenerator>;
