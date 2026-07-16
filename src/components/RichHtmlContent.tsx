import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

interface RichHtmlContentProps {
  html: string | null | undefined;
  className?: string;
}

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
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
  });

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none dark:prose-invert [&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
};

export default RichHtmlContent;
