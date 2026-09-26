import { useRef, useState } from "react";
import { ArrowRight, LoaderCircle, TriangleAlert } from "lucide-react";
import type { Language } from "../lib/api";
import { GENERATOR_INPUT_ID } from "../lib/ui";
import type { Generator } from "../lib/useGenerator";

const MAX = 200;

const LANGUAGES: { value: Language; label: string; lang?: string }[] = [
  { value: "hinglish", label: "Hinglish" },
  { value: "hindi", label: "हिंदी", lang: "hi" },
  { value: "english", label: "English" },
];

export function GeneratorForm({ gen }: { gen: Generator }) {
  const empty = !gen.situation.trim();
  const [askingAge, setAskingAge] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const adultButton = useRef<HTMLButtonElement>(null);

  function toggleAdult() {
    if (gen.adult) gen.setAdult(false);
    else if (ageConfirmed) gen.setAdult(true);
    else setAskingAge(true);
  }

  function answerAge(isAdult: boolean) {
    setAskingAge(false);
    if (isAdult) {
      setAgeConfirmed(true);
      gen.setAdult(true);
    }
    adultButton.current?.focus();
  }

  return (
    <form
      className="mt-9 max-w-[640px]"
      onSubmit={(e) => {
        e.preventDefault();
        gen.generate();
      }}
    >
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={GENERATOR_INPUT_ID} className="text-[17px] font-bold text-ink">
          What just happened?
        </label>
        <span className="text-sm text-muted tabular-nums" aria-hidden>
          {gen.situation.length}/{MAX}
        </span>
      </div>
      <input
        id={GENERATOR_INPUT_ID}
        type="text"
        value={gen.situation}
        onChange={(e) => gen.setSituation(e.target.value)}
        maxLength={MAX}
        placeholder={gen.adult ? "jab ex ne raat 2 baje 'hey' bheja…" : "jab code pehli baar mein chal jaaye…"}
        autoComplete="off"
        enterKeyHint="go"
        className="mt-2.5 h-[60px] w-full rounded-md border-3 border-ink bg-white px-4 text-lg text-ink shadow-hard-md placeholder:text-muted/70 focus-visible:outline-offset-4"
      />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <fieldset className="flex rounded-md border-3 border-ink bg-white p-1 shadow-hard-sm">
            <legend className="sr-only">Caption language</legend>
            {LANGUAGES.map((l) => (
              <label key={l.value} className="relative">
                <input
                  type="radio"
                  name="language"
                  value={l.value}
                  checked={gen.language === l.value}
                  onChange={() => gen.setLanguage(l.value)}
                  className="peer sr-only"
                />
                <span
                  lang={l.lang}
                  className="block cursor-pointer rounded-[8px] border-2 border-transparent px-3.5 py-1.5 font-bold text-ink transition-colors peer-checked:border-ink peer-checked:bg-yellow peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink hover:bg-cream peer-checked:hover:bg-yellow"
                >
                  {l.label}
                </span>
              </label>
            ))}
          </fieldset>

          <button
            ref={adultButton}
            type="button"
            aria-pressed={gen.adult}
            title="Adult humour mode"
            onClick={toggleAdult}
            className={`btn h-[50px] gap-2.5 px-3.5 text-[16px] ${gen.adult ? "bg-pink" : "bg-white"}`}
          >
            18+
            <span
              aria-hidden
              className={`relative h-[18px] w-8 rounded-full border-2 border-ink transition-colors ${gen.adult ? "bg-ink" : "bg-cream"}`}
            >
              <span
                className={`absolute top-px size-3 rounded-full border-2 border-ink bg-white transition-[left] ${gen.adult ? "left-[15px]" : "left-px"}`}
              />
            </span>
          </button>
        </div>

        <button
          type="submit"
          disabled={empty || gen.loading}
          data-loading={gen.loading || undefined}
          className="btn btn-ink btn-lg h-14 px-6 text-lg data-loading:cursor-progress data-loading:opacity-100"
        >
          {gen.loading ? (
            <>
              <LoaderCircle className="size-5 animate-spin" aria-hidden />
              Meme ban raha hai…
            </>
          ) : (
            <>
              Generate meme
              <ArrowRight className="size-5" strokeWidth={2.75} aria-hidden />
            </>
          )}
        </button>
      </div>

      {askingAge && (
        <div
          role="alertdialog"
          aria-labelledby="age-title"
          aria-describedby="age-desc"
          onKeyDown={(e) => e.key === "Escape" && answerAge(false)}
          className="mt-5 rounded-md border-3 border-ink bg-white p-4 shadow-hard-sm"
        >
          <p id="age-title" className="font-bold text-ink">
            Switch on 18+ mode?
          </p>
          <p id="age-desc" className="mt-1 text-[15px] leading-snug">
            Adult humour: double meanings, dating, hangovers and light gaalis. Still nothing explicit. Only for
            people 18 or older.
          </p>
          <div className="mt-3.5 flex flex-wrap gap-2.5">
            <button type="button" autoFocus className="btn h-10 bg-pink px-4" onClick={() => answerAge(true)}>
              I'm 18+, switch it on
            </button>
            <button type="button" className="btn h-10 bg-white px-4" onClick={() => answerAge(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {gen.error && (
        <p
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-md border-3 border-ink bg-white p-3 pr-4 font-medium text-ink shadow-hard-sm"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-[8px] border-2 border-ink bg-pink">
            <TriangleAlert className="size-4" strokeWidth={2.5} aria-hidden />
          </span>
          <span className="pt-1">{gen.error}</span>
        </p>
      )}
    </form>
  );
}
