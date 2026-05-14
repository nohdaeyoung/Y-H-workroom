import parse from "html-react-parser";
import { sanitizeRichHtml } from "@/lib/sanitize";

type Props = {
  html: string;
  className?: string;
};

export default function SafeHtml({ html, className }: Props) {
  return <div className={className}>{parse(sanitizeRichHtml(html))}</div>;
}
