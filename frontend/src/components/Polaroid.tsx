import { useState, type ComponentType } from "react";
import { Link, LoaderCircle, PencilLine, RefreshCw, type LucideProps } from "lucide-react";
import { tilt } from "../lib/ui";
import type { Generator } from "../lib/useGenerator";
import { MemeView } from "./MemeView";
import { Starburst } from "./Starburst";

export function Polaroid({ gen }: { gen: Generator }) {
  const { take, loading } = gen;

  return (
    <div className="relative mx-auto w-full max-w-[440px] md:mx-0 md:ml-auto">
      <article
        aria-label="Your meme"
        aria-busy={loading}
        className="card tilt rounded-lg bg-white p-4 pb-5 shadow-hard-xl"
        style={tilt(3)}
      >
        <div className="aspect-square overflow-hidden rounded-sm border-3 border-ink">
          {loading ? (
            <div className="skeleton size-full" aria-hidden />
          ) : (
            <MemeView captions={take.captions} imageUrl={take.imageUrl} art={take.art} />
          )}
        </div>

        {loading ? (
          <div className="mt-4 flex items-center justify-between gap-3" aria-hidden>
            <div className="space-y-2">
              <div className="skeleton h-5 w-32 rounded" />
              <div className="skeleton h-3.5 w-44 rounded" />
            </div>
            <div className="flex gap-2.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton size-11 rounded-sm border-3 border-ink/20" />
              ))}
            </div>
          </div>
        ) : gen.editing ? (
          <EditPanel
            key={gen.index}
            initial={take.captions}
            onSave={gen.saveCaptions}
            onCancel={gen.stopEditing}
          />
        ) : (
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-display text-xl text-ink" aria-live="polite">
                Take {gen.index + 1} of {gen.takes.length}
                {take.adult && (
                  <span className="rounded-[6px] border-2 border-ink bg-pink px-1.5 py-0.5 font-sans text-[11px] leading-none font-bold">
                    18+
                  </span>
                )}
              </p>
              <p className="truncate text-sm text-muted" title={take.subtitle}>
                {take.subtitle}
              </p>
            </div>
            <div className="flex shrink-0 gap-2.5">
              <IconButton label="Edit captions" icon={PencilLine} onClick={gen.startEditing} />
              <IconButton label="Next take" icon={RefreshCw} onClick={gen.nextTake} />
              <IconButton label="Copy link" icon={Link} onClick={gen.copyLink} />
            </div>
          </div>
        )}
      </article>

      <Starburst className="absolute -top-[72px] -right-1 size-[96px] md:-top-[76px] md:-right-10 md:size-[118px] xl:-right-16">
        <span className="block text-[28px] leading-[0.85] md:text-[34px]">3</span>
        <span className="block text-[15px] md:text-[17px]">takes</span>
      </Starburst>
      <span
        className="sticker tilt absolute -bottom-6 -left-2 bg-pink text-[17px] md:-left-12"
        style={tilt(-2)}
      >
        Hinglish? Haan ji.
      </span>
    </div>
  );
}

function IconButton({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: ComponentType<LucideProps>;
  onClick: () => void;
}) {
  return (
    <button type="button" className="btn icon-btn" aria-label={label} title={label} onClick={onClick}>
      <Icon className="size-5" strokeWidth={2.5} aria-hidden />
    </button>
  );
}

function EditPanel({
  initial,
  onSave,
  onCancel,
}: {
  initial: string[];
  onSave: (captions: string[]) => Promise<void>;
  onCancel: () => void;
}) {
  const [drafts, setDrafts] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const blank = drafts.every((d) => !d.trim());

  async function save() {
    if (saving || blank) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(drafts.map((d) => d.trim()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update the meme. Try again?");
      setSaving(false);
    }
  }

  return (
    <form
      className="mt-4"
      aria-label="Edit captions"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      onKeyDown={(e) => e.key === "Escape" && onCancel()}
    >
      <div className="space-y-2">
        {drafts.map((draft, i) => (
          <label key={i} className="flex items-center gap-2">
            <span className="grid size-7 shrink-0 place-items-center rounded-[7px] border-2 border-ink bg-yellow text-sm font-bold text-ink">
              {i + 1}
              <span className="sr-only"> caption</span>
            </span>
            <input
              value={draft}
              autoFocus={i === 0}
              maxLength={120}
              onChange={(e) => setDrafts((all) => all.map((d, j) => (j === i ? e.target.value : d)))}
              className="h-10 min-w-0 flex-1 rounded-[9px] border-3 border-ink bg-white px-3 text-[15px] text-ink focus-visible:outline-offset-2"
            />
          </label>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-ink">
          {error}
        </p>
      )}
      <div className="mt-3.5 flex justify-end gap-2.5">
        <button type="button" className="btn h-10 bg-white px-4" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn h-10 bg-yellow px-4" disabled={saving || blank}>
          {saving && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {saving ? "Updating…" : "Update meme"}
        </button>
      </div>
    </form>
  );
}
