export type ExerciseVideo = { kind: "embed" | "video" | "link"; url: string; originalUrl: string };

export function getExerciseVideo(value?: string): ExerciseVideo | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split("/").filter(Boolean);
    let youtubeId: string | null = null;
    if (host === "youtu.be") youtubeId = parts[0] ?? null;
    if (["youtube.com", "www.youtube.com", "m.youtube.com", "www.youtube-nocookie.com"].includes(host)) {
      youtubeId = url.pathname === "/watch" ? url.searchParams.get("v") : ["embed", "shorts"].includes(parts[0]) ? parts[1] : null;
    }
    if (youtubeId && /^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
      return { kind: "embed", url: `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`, originalUrl: url.href };
    }
    if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(host)) {
      const id = host === "player.vimeo.com" && parts[0] === "video" ? parts[1] : parts[0];
      if (id && /^\d+$/.test(id)) {
        const hash = url.searchParams.get("h") ?? parts[1];
        const privacyHash = hash && /^[a-zA-Z0-9]+$/.test(hash) ? `&h=${hash}` : "";
        return { kind: "embed", url: `https://player.vimeo.com/video/${id}?dnt=1${privacyHash}`, originalUrl: url.href };
      }
    }
    return { kind: /\.(mp4|webm)$/i.test(url.pathname) ? "video" : "link", url: url.href, originalUrl: url.href };
  } catch { return null; }
}
