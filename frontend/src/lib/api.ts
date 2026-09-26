export type Language = "hinglish" | "hindi" | "english";

export interface Take {
  template_id: string;
  template_name: string;
  captions: string[];
  image_url: string;
  page_url: string;
}

export class ApiError extends Error {}

const FALLBACK = "Something went wrong on our side. Try again?";

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Can't reach the meme kitchen. Check your connection and try again.");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 429) {
      throw new ApiError(data?.error ?? "Too many memes too fast. Try again in a minute.");
    }
    // 400/422 carry a message meant for people; 5xx proxy pages may not.
    throw new ApiError(typeof data?.error === "string" ? data.error : FALLBACK);
  }
  return data as T;
}

/** `avoid`: template IDs just shown, so the API picks different ones. `adult`: 18+ mode. */
export function generateMeme(situation: string, language: Language, avoid: string[], adult: boolean) {
  return post<{ takes: Take[] }>("/api/meme", { situation, language, avoid, adult });
}

export function recaption(template_id: string, captions: string[], language: Language) {
  return post<{ image_url: string; page_url: string }>("/api/caption", {
    template_id,
    captions,
    language,
  });
}
