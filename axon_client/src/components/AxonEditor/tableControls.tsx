"use client";

import type { Editor } from "@tiptap/core";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";

type BtnPos = { top: number; left: number; height: number; width: number };

export const TableControls = ({ editor }: { editor: Editor | null }) => {
  const [colBtn, setColBtn] = useState<BtnPos | null>(null);
  const [rowBtn, setRowBtn] = useState<BtnPos | null>(null);

  useEffect(() => {
    if (!editor) return;

    const editorDom = editor.view.dom as HTMLElement;

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cell = target.closest("td, th") as HTMLElement | null;

      if (!cell) {
        setColBtn(null);
        setRowBtn(null);
        return;
      }

      const row = cell.closest("tr") as HTMLElement | null;
      const table = cell.closest("table") as HTMLElement | null;
      if (!row || !table) return;
      const isLastCol = cell === row.lastElementChild;
      const tbody = table.querySelector("tbody");
      const lastRow = tbody ? tbody.lastElementChild : table.lastElementChild;
      const isLastRow = row === lastRow;
      const cellRect = cell.getBoundingClientRect();
      const tableRect = table.getBoundingClientRect();

      console.log({
        top: tableRect.top,
        left: tableRect.right + 6,
        height: tableRect.height,
        width: tableRect.width,
      });

      setColBtn(
        isLastCol
          ? {
              top: tableRect.top,
              left: tableRect.right + 6,
              height: tableRect.height,
              width: 30,
            }
          : null,
      );

      setRowBtn(
        isLastRow
          ? {
              top: tableRect.bottom + 6,
              left: tableRect.left,
              height: 30,
              width: tableRect.width,
            }
          : null,
      );
    };

    const handleMouseLeave = () => {
      // Small delay so the button itself is hoverable before it disappears
      setTimeout(() => {
        setColBtn(null);
        setRowBtn(null);
      }, 1000);
    };

    editorDom.addEventListener("mousemove", handleMouseMove);
    editorDom.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      editorDom.removeEventListener("mousemove", handleMouseMove);
      editorDom.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [editor]);

  if (!editor || (!colBtn && !rowBtn)) return null;

  const btnClass =
    "absolute z-[200] flex items-center justify-center rounded-xl " +
    "bg-accent/40 hover:bg-accent text-white shadow-md " +
    "transition-colors duration-150 cursor-pointer";

  return createPortal(
    <>
      {colBtn && (
        <button
          className={btnClass}
          style={{
            top: colBtn.top,
            left: colBtn.left,
            height: colBtn.height,
            width: colBtn.width,
          }}
          title="Add column"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().addColumnAfter().run();
          }}
        >
          <Plus size={14} />
        </button>
      )}

      {rowBtn && (
        <button
          className={btnClass}
          style={{
            top: rowBtn.top,
            left: rowBtn.left,
            height: rowBtn.height,
            width: rowBtn.width,
          }}
          title="Add row"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().addRowAfter().run();
          }}
        >
          <Plus size={14} />
        </button>
      )}
    </>,
    document.body,
  );
};

export default TableControls;
