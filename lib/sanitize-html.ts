import DOMPurify from 'dompurify';

const BASE: DOMPurify.Config = {
  USE_PROFILES: { html: true },
  ADD_TAGS: ['table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col'],
  ADD_ATTR: ['colspan', 'rowspan', 'scope', 'data-colwidth'],
};

/**
 * Sanitize untrusted HTML before `dangerouslySetInnerHTML`.
 * Keeps common rich-text tags from editors; strips scripts and event handlers.
 */
export function sanitizeHtml(dirty: string, extra?: DOMPurify.Config): string {
  if (!dirty?.trim()) return '';
  return DOMPurify.sanitize(dirty, { ...BASE, ...extra });
}

/** Heuristic: chuỗi có vẻ là HTML (vd. từ rich editor), khác văn bản thuần legacy. */
export function isLikelyHtml(s: string | null | undefined): boolean {
  if (!s?.trim()) return false;
  return /<[a-z][\s\S]*>/i.test(s.trim());
}
