import parse from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";

type Props = {
  html: string;
  className?: string;
};

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3", "h4",
  "ul", "ol", "li", "blockquote", "code", "pre", "a", "img",
  "hr", "span", "div",
];

const ALLOWED_ATTR = ["href", "src", "alt", "title", "class", "target", "rel"];

export default function SafeHtml({ html, className }: Props) {
  const sanitized = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
  return <div className={className}>{parse(sanitized)}</div>;
}
