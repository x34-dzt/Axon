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
import AutoJoiner from "tiptap-extension-auto-joiner";
import Code from "@tiptap/extension-code";
import { cx } from "class-variance-authority";
import { AxonImageExtension } from "./plugins/axon-image-upload";
import TiptapImage from "./Nodes/TipTapImage";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import type { Transaction, EditorState } from "prosemirror-state";
import type { Node } from "prosemirror-model";

const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cx(
      "text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer",
    ),
  },
});

const highlight = Highlight.configure({ multicolor: true });
const color = TipTapColor.configure({ types: ["textStyle"] });

const taskList = TaskList.configure({
  HTMLAttributes: { class: cx("not-prose pl-2") },
});

const taskItem = TaskItem.configure({
  HTMLAttributes: { class: cx("flex items-start my-4") },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: cx("mt-4 mb-6 border-t border-muted-foreground"),
  },
});

const underline = TiptapUnderline.configure({
  HTMLAttributes: { class: cx("underline underline-offset-4") },
});

const code = Code.configure({
  HTMLAttributes: {
    class: "bg-neutral-800 rounded-sm px-[0.25em] py-[0.3em] text-white",
  },
});

const starterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: { class: cx("list-disc list-outside leading-3 -mt-2") },
  },
  orderedList: {
    HTMLAttributes: { class: cx("list-decimal list-outside leading-3 -mt-2") },
  },
  listItem: {
    HTMLAttributes: { class: cx("leading-normal -mb-2") },
  },
  blockquote: {
    HTMLAttributes: { class: cx("border-l-4 border-neutral-600") },
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
  dropcursor: { color: "#DBEAFE", width: 4 },
  gapcursor: false,
});

const table = Table.configure({
  resizable: true,
  HTMLAttributes: {
    draggable: false,
    class: cx("table-fixed w-full  rounded-md overflow-hidden"),
  },
});

const tableRow = TableRow.configure({
  HTMLAttributes: {
    class: cx("border-b border-accent last:border-b-0 word-wrap"),
  },
});

const tableCell = TableCell.configure({
  HTMLAttributes: {
    class: cx(
      "border border-accent px-2 py-1 text-sm align-top min-w-[80px] word-wrap",
    ),
  },
});

const tableHeader = TableHeader.configure({
  HTMLAttributes: {
    class: cx(
      "border border-accent bg-accent/40 px-2 py-1 text-sm font-semibold text-left align-top min-w-[80px] word-wrap",
    ),
  },
});

const CleanEmptyTables = Extension.create({
  name: "cleanEmptyTables",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("cleanEmptyTables"),
        appendTransaction(transactions, _oldState, newState) {
          // Only run after a drop transaction
          const isDrop = transactions.some(
            (tr) => tr.getMeta("uiEvent") === "drop",
          );
          if (!isDrop) return null;

          const tr = newState.tr;
          let modified = false;

          newState.doc.descendants((node, pos) => {
            if (node.type.name !== "table") return;

            // A table is "empty" if every cell has no real text content
            let hasContent = false;
            node.descendants((child) => {
              if (child.isText && child.text?.trim()) {
                hasContent = true;
              }
            });

            if (!hasContent) {
              tr.delete(pos, pos + node.nodeSize);
              modified = true;
            }
          });

          return modified ? tr : null;
        },
      }),
    ];
  },
});

export const defaultExtensions = [
  underline,
  starterKit,
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === "heading") {
        return `Heading ${node.attrs.level}`;
      }
      return "Start typing, or Press '/' for commands, or '/Ai' for AI generation...";
    },
    includeChildren: true,
  }),
  highlight,
  code,
  AxonImageExtension.configure({
    styles: { class: "rounded-md w-[300px] h-auto m-0" },
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
  table,
  tableRow,
  tableCell,
  tableHeader,
  CleanEmptyTables,
];
