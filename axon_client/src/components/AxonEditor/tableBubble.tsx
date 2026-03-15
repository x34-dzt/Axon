"use client";

import type { Editor } from "@tiptap/core";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUpToLine,
  ArrowDownToLine,
  Trash2,
  LayoutList,
  MoreVertical,
} from "lucide-react";

type ActionButton = {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  danger?: boolean;
};

type Pos = { top: number; left: number };

const Btn = ({
  label,
  icon,
  action,
  danger = false,
  onClose,
}: ActionButton & { onClose: () => void }) => (
  <button
    type="button"
    title={label}
    onMouseDown={(e) => {
      e.preventDefault();
      e.stopPropagation();
      action();
      onClose();
    }}
    className={`
      flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs
      transition-colors whitespace-nowrap
      ${
        danger
          ? "text-red-400 hover:bg-red-500/15"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }
    `}
  >
    <span className="shrink-0">{icon}</span>
    {label}
  </button>
);

const Divider = () => <div className="h-px bg-border/60 my-0.5" />;

export const TableBubbleMenu = ({ editor }: { editor: Editor | null }) => {
  const [triggerPos, setTriggerPos] = useState<Pos | null>(null);
  const [menuPos, setMenuPos] = useState<Pos | null>(null);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const updateTrigger = useCallback(() => {
    if (!editor) return;

    const { from } = editor.state.selection;
    const $pos = editor.state.doc.resolve(from);

    let inCell = false;
    for (let d = $pos.depth; d > 0; d--) {
      const name = $pos.node(d)?.type.name;
      if (name === "tableCell" || name === "tableHeader") {
        inCell = true;
        break;
      }
    }

    if (!inCell) {
      setTriggerPos(null);
      setMenuPos(null);
      return;
    }

    let cellDom = editor.view.domAtPos(from).node as HTMLElement;
    while (
      cellDom &&
      cellDom.tagName !== "TD" &&
      cellDom.tagName !== "TH" &&
      cellDom !== editor.view.dom
    ) {
      cellDom = cellDom.parentElement as HTMLElement;
    }

    if (!cellDom || (cellDom.tagName !== "TD" && cellDom.tagName !== "TH")) {
      setTriggerPos(null);
      return;
    }

    const rect = cellDom.getBoundingClientRect();
    setTriggerPos({
      top: rect.top + rect.height / 2,
      left: rect.left + 6,
    });
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    editor.on("selectionUpdate", updateTrigger);
    editor.on("blur", () => {});
    return () => {
      editor.off("selectionUpdate", updateTrigger);
    };
  }, [editor, updateTrigger]);

  useEffect(() => {
    if (!menuPos) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      )
        return;
      setMenuPos(null);
    };

    document.addEventListener("mousedown", handleClick, true);
    return () => document.removeEventListener("mousedown", handleClick, true);
  }, [menuPos]);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (menuPos) {
      setMenuPos(null);
      return;
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 4,
      left: rect.left,
    });
  };

  if (!editor || !triggerPos) return null;
  const rowActions: ActionButton[] = [
    {
      label: "Insert row above",
      icon: <ArrowUpToLine size={13} />,
      action: () => editor.chain().focus().addRowBefore().run(),
    },
    {
      label: "Insert row below",
      icon: <ArrowDownToLine size={13} />,
      action: () => editor.chain().focus().addRowAfter().run(),
    },
  ];

  const colActions: ActionButton[] = [
    {
      label: "Insert col left",
      icon: <ArrowLeftToLine size={13} />,
      action: () => editor.chain().focus().addColumnBefore().run(),
    },
    {
      label: "Insert col right",
      icon: <ArrowRightToLine size={13} />,
      action: () => editor.chain().focus().addColumnAfter().run(),
    },
  ];

  const dangerActions: ActionButton[] = [
    {
      label: "Toggle header",
      icon: <LayoutList size={13} />,
      action: () => editor.chain().focus().toggleHeaderRow().run(),
    },
    {
      label: "Delete row",
      icon: <Trash2 size={13} />,
      action: () => editor.chain().focus().deleteRow().run(),
      danger: true,
    },
    {
      label: "Delete column",
      icon: <Trash2 size={13} />,
      action: () => editor.chain().focus().deleteColumn().run(),
      danger: true,
    },
    {
      label: "Delete table",
      icon: <Trash2 size={13} />,
      action: () => editor.chain().focus().deleteTable().run(),
      danger: true,
    },
  ];

  const closeMenu = () => setMenuPos(null);

  return createPortal(
    <>
      <button
        ref={triggerRef}
        type="button"
        onMouseDown={handleTriggerClick}
        style={{
          position: "fixed",
          top: triggerPos.top,
          left: triggerPos.left,
          transform: "translate(-100%, -50%)",
          zIndex: 300,
        }}
        className="flex items-center justify-center w-4 h-5 rounded bg-background/80 border border-border shadow-sm hover:bg-accent transition-colors"
      >
        <MoreVertical size={11} className="text-muted-foreground" />
      </button>

      {menuPos && (
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: menuPos.top,
            left: menuPos.left,
            zIndex: 400,
          }}
          className="flex flex-col w-44 bg-customMain/50 backdrop-blur-md border border-border shadow-xl rounded-lg p-1"
        >
          {rowActions.map((a) => (
            <Btn key={a.label} {...a} onClose={closeMenu} />
          ))}
          {colActions.map((a) => (
            <Btn key={a.label} {...a} onClose={closeMenu} />
          ))}
          {dangerActions.map((a) => (
            <Btn key={a.label} {...a} onClose={closeMenu} />
          ))}
        </div>
      )}
    </>,
    document.body,
  );
};

export default TableBubbleMenu;
