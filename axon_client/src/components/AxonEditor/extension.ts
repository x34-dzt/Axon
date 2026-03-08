import {
  TiptapLink,
  TaskList,
  TaskItem,
  HorizontalRule,
  StarterKit,
  Placeholder,
  TiptapUnderline,
} from "novel";
import Highlight from "@tiptap/extension-highlight";
import TipTapColor from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import GlobalDragHandle from "tiptap-extension-global-drag-handle";
import AutoJoiner from "tiptap-extension-auto-joiner"; // optional
import Code from "@tiptap/extension-code";
import { cx } from "class-variance-authority";

import { AxonImageExtension } from "./plugins/axon-image-upload";
import TiptapImage from "./Nodes/TipTapImage";

const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cx(
      "text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer",
    ),
  },
});

const highlight = Highlight.configure({
  multicolor: true,
});

const color = TipTapColor.configure({
  types: ["textStyle"],
});

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cx("not-prose pl-2"),
  },
});
const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cx("flex items-start my-4"),
  },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: cx("mt-4 mb-6 border-t border-muted-foreground"),
  },
});

const underline = TiptapUnderline.configure({
  HTMLAttributes: {
    class: cx("underline underline-offset-4"),
  },
});

const code = Code.configure({
  HTMLAttributes: {
    class: "bg-neutral-800 rounded-sm px-[0.25em] py-[0.3em] text-white",
  },
});

const starterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: {
      class: cx("list-disc list-outside leading-3 -mt-2"),
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: cx("list-decimal list-outside leading-3 -mt-2"),
    },
  },
  listItem: {
    HTMLAttributes: {
      class: cx("leading-normal -mb-2"),
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: cx("border-l-4 border-neutral-600"),
    },
  },
  codeBlock: {
    HTMLAttributes: {
      class: cx(
        "rounded-sm bg-red-900 text-white border p-5 font-mono font-medium",
      ),
    },
  },
  code: {
    HTMLAttributes: {
      class: cx(
        "rounded-md bg-neutral-900 px-1.5 custom-none-pseudo py-1 font-mono font-medium",
      ),
      spellcheck: "false",
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: "#DBEAFE",
    width: 4,
  },
  gapcursor: false,
});

export const defaultExtensions = [
  underline,
  starterKit,
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === "heading") {
        return `Heading ${node.attrs.level}`;
      }
      return "Start typing, or Press '/' for commands, or '++' for AI autocomplete...";
    },
    includeChildren: true,
  }),
  highlight,
  code,
  AxonImageExtension.configure({
    styles: {
      class: "rounded-md w-[300px] h-auto m-0",
    },
  }),
  TiptapImage,
  tiptapLink,
  GlobalDragHandle,
  AutoJoiner,
  TextStyle,
  color,
  taskList,
  taskItem,
  horizontalRule,
];
