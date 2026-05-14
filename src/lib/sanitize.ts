import sanitizeHtml from "sanitize-html";

/**
 * 서버사이드 리치 텍스트 살균. TipTap 에디터 출력(HTML) 입력 받아 안전한 HTML 반환.
 *
 * isomorphic-dompurify 대신 사용 — vercel Node 런타임이 jsdom 의존 트리에서
 * ERR_REQUIRE_ESM 던지는 문제 회피 (sanitize-html은 pure CommonJS).
 */
export function sanitizeRichHtml(input: string): string {
  if (!input) return "";
  return sanitizeHtml(input, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "u",
      "s",
      "del",
      "ins",
      "figure",
      "figcaption",
      "span",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["style", "class"],
      a: ["href", "name", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height"],
      span: ["style", "class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
    },
  });
}
