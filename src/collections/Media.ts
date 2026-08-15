import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  admin: { useAsTitle: "alt", group: "Content" },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    mimeTypes: ["image/*"],
    imageSizes: [
      { name: "thumb", width: 480, height: undefined, position: "centre" },
      { name: "card", width: 900, height: undefined, position: "centre" },
      { name: "hero", width: 1600, height: undefined, position: "centre" },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      // GUARDRAIL (blueprint §8.1): accessibility stops being something you
      // remember and becomes something you cannot skip.
      required: true,
      admin: {
        description:
          "Describe the image for someone who cannot see it. A filename is not alt text.",
      },
      validate: (value: string | null | undefined) => {
        if (!value || value.trim().length < 5)
          return "Alt text must be at least 5 characters and actually describe the image.";
        if (/\.(png|jpe?g|webp|gif|svg)$/i.test(value.trim()))
          return "That looks like a filename, not a description.";
        return true;
      },
    },
    { name: "caption", type: "text" },
  ],
};
