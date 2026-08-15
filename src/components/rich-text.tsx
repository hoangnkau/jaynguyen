import { RichText as LexicalRichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

/**
 * Renders Lexical content from the CMS with the site's prose styling.
 * Kept in one place so every page that shows rich text looks the same.
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
      className={`max-w-[var(--container-prose)] [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-[1.4rem] [&_h3]:mb-2 [&_h3]:mt-8 [&_h3]:text-[1.15rem] [&_li]:mb-1.5 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-5 [&_strong]:font-semibold [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-5 ${className}`}
    >
      <LexicalRichText data={data} />
    </div>
  );
}
