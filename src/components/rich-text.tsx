import { RichText as LexicalRichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

/**
 * Renders Lexical content from the CMS with the site's prose styling.
 * Kept in one place so every page that shows rich text looks the same.
 *
 * Blockquote, horizontal rule and inline code were added when the blog went
 * in: the editor could always produce them, and until then they rendered as
 * browser defaults — a Times-ish indented block and a grey 2px line in the
 * middle of a page that uses neither. An unstyled element is not a neutral
 * one, it is a wrong one.
 */
export function RichText({
  data,
  className = "",
}: {
  data: SerializedEditorState | null | undefined;
  className?: string;
}) {
  if (!data) return null;

  return (
    <div
      className={[
        "max-w-[var(--container-prose)]",
        "[&_p]:mb-5",
        "[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2",
        "[&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-[1.4rem] [&_h2]:text-fg",
        "[&_h3]:mb-2 [&_h3]:mt-8 [&_h3]:text-[1.15rem] [&_h3]:text-fg",
        "[&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-5",
        "[&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_li]:mb-1.5",
        "[&_strong]:font-semibold [&_strong]:text-fg",
        // A quote is a change of voice, so it gets the accent rule and the
        // page background rather than a card — it is an aside in the prose,
        // not a separate object sitting on top of it.
        "[&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:border-accent",
        "[&_blockquote]:pl-5 [&_blockquote]:text-[16px] [&_blockquote]:italic",
        "[&_hr]:my-10 [&_hr]:border-t [&_hr]:border-border",
        "[&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1.5 [&_code]:py-0.5",
        "[&_code]:font-mono [&_code]:text-[0.87em] [&_code]:text-fg",
        className,
      ].join(" ")}
    >
      <LexicalRichText data={data} />
    </div>
  );
}
