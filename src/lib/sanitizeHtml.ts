import DOMPurify from "dompurify";

const RICH_TEXT_TAGS = ["p", "strong", "em", "ul", "ol", "li", "a", "br"];
const RICH_TEXT_ATTR = ["href", "target", "rel"];

/** Sanitizes admin-authored rich text (from RichTextEditor) before dangerouslySetInnerHTML. */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: RICH_TEXT_TAGS, ALLOWED_ATTR: RICH_TEXT_ATTR });
}

/** Strips all markup, returning plain text — for card/list previews of rich text fields. */
export function stripHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}
