import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

interface RichHtmlContentProps {
  html: string | null | undefined;
  className?: string;
}

/**
 * Renders rich-text HTML from the admin editor as closely as possible:
 * paragraphs, line breaks, bold/italic/underline, lists, etc.
 */
const RichHtmlContent = ({ html, className }: RichHtmlContentProps) => {
  if (!html) return null;

  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "blockquote",
      "a",
      "span",
      "sub",
      "sup",
      "div",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class", "style", "dir"],
  });

  return (
    <div
      className={cn(
        "exam-editor-html max-w-none text-[15px] leading-7 text-foreground break-words",
        // Match typical text-editor paragraph rhythm
        "[&_p]:my-0 [&_p]:mb-3 [&_p:last-child]:mb-0",
        // Keep empty editor lines (<p><br></p>) visible
        "[&_p:empty]:min-h-[1.75em] [&_p:has(>br:only-child)]:min-h-[1.75em]",
        "[&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_u]:underline",
        "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:ps-5",
        "[&_li]:my-0.5",
        "[&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-bold",
        "[&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-bold",
        "[&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-bold",
        "[&_blockquote]:my-2 [&_blockquote]:border-s-2 [&_blockquote]:border-border [&_blockquote]:ps-3 [&_blockquote]:italic",
        "[&_a]:text-primary [&_a]:underline",
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
};

export default RichHtmlContent;
