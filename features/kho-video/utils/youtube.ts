/**
 * Trích ID video YouTube từ URL (watch, embed, shorts, youtu.be).
 */
export function parseYoutubeVideoId(input: string | null | undefined): string | null {
  if (!input?.trim()) return null;
  const raw = input.trim();
  try {
    const url = new URL(raw.includes('://') ? raw : `https://${raw}`);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = url.pathname.replace(/^\//, '').split(/[/?#]/)[0];
      return id.length >= 6 ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      const v = url.searchParams.get('v');
      if (v) return v;

      const embed = url.pathname.match(/\/embed\/([^/?]+)/);
      if (embed) return embed[1];

      const shorts = url.pathname.match(/\/shorts\/([^/?]+)/);
      if (shorts) return shorts[1];

      const live = url.pathname.match(/\/live\/([^/?]+)/);
      if (live) return live[1];
    }
  } catch {
    return null;
  }
  return null;
}

export function getYoutubeThumbnailUrl(videoId: string, quality: 'mq' | 'hq' | 'max' = 'mq'): string {
  const q = quality === 'hq' ? 'hqdefault' : quality === 'max' ? 'maxresdefault' : 'mqdefault';
  return `https://img.youtube.com/vi/${videoId}/${q}.jpg`;
}

export function getYoutubeEmbedSrc(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;
}

/** URL trực tiếp tới file video (trình duyệt phát được) */
export function isDirectVideoUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  return /\.(mp4|webm|ogg)(\?|#|$)/i.test(url.trim());
}
