import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { NodeView } from "@tiptap/pm/view";
import React, { useEffect, useRef, useState } from "react";
import Moveable from "react-moveable";
import { NodeViewWrapper } from "@tiptap/react";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";

interface ImageAttributes {
  src: string | null;
  alt: string | null;
  title: string | null;
  width: number | null;
  height: number | null;
  style: string;
}

interface ImageOptions {
  inline: boolean;
  allowBase64: boolean;
}

const moveableStyles = `
  .moveable-control {
    background-color: #4B5563 !important; /* Neutral gray color */
    border: 2px solid #E5E7EB !important; /* Light gray border */
  }
  .moveable-line {
    background-color: #9CA3AF !important; /* Lighter gray for guidelines */
  }
`;

// @ts-ignore
const ImageComponent = ({ node, updateAttributes, editor }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [isSelected, setIsSelected] = useState(false);
  const [moveableKey, setMoveableKey] = useState(0);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        imageRef.current &&
        // @ts-ignore
        !imageRef.current.contains(event.target as Node)
      ) {
        setIsSelected(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSelected(true);
  };

  const getCurrentStyles = () => {
    const style = node.attrs.style || "";
    const widthMatch = style.match(/width:\s*(\d+)px/);
    const marginMatch = style.match(/margin:\s*([^;]+)/);

    return {
      width: widthMatch ? parseInt(widthMatch[1]) : 300,
      margin: marginMatch ? marginMatch[1] : "0",
    };
  };

  const handleAlignment = (alignment: "left" | "center" | "right") => {
    const margins = {
      left: "0",
      center: "0 auto",
      right: "0 0 0 auto",
    };

    const { width } = getCurrentStyles();
    updateAttributes({
      style: `width: ${width}px; margin: ${margins[alignment]};`,
    });

    setMoveableKey((prev) => prev + 1);

    setTimeout(() => {
      if (imageRef.current) {
        const event = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
        });
        imageRef.current.dispatchEvent(event);
      }
    }, 0);
  };

  const updateMediaSize = (width: number) => {
    const { margin } = getCurrentStyles();
    updateAttributes({
      width,
      style: `width: ${width}px; margin: ${margin};`,
    });
  };

  const { width: initialWidth, margin: initialMargin } = getCurrentStyles();

  return (
    <NodeViewWrapper className="react-component-with-content rounded-md">
      <div className="relative" onClick={handleImageClick}>
        <img
          ref={imageRef}
          src={node.attrs.src}
          alt={node.attrs.alt}
          title={node.attrs.title}
          draggable={false}
          style={{
            width: `${initialWidth}px`,
            height: "auto",
            margin: initialMargin,
          }}
          className="tiptap-image"
        />

        {isSelected && editor.isEditable && (
          <>
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-neutral-800/80 backdrop-blur-sm rounded-md shadow-lg py-1 px-2 flex gap-1">
              <button
                type="button"
                className="p-1.5 rounded-sm hover:bg-neutral-700 transition-colors duration-200"
                onClick={() => handleAlignment("left")}
                aria-label="Align Left"
              >
                <AlignLeft className="w-4 h-4 text-neutral-100" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded-sm hover:bg-neutral-700 transition-colors duration-200"
                onClick={() => handleAlignment("center")}
                aria-label="Align Center"
              >
                <AlignCenter className="w-4 h-4 text-neutral-100" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded-sm hover:bg-neutral-700 transition-colors duration-200"
                onClick={() => handleAlignment("right")}
                aria-label="Align Right"
              >
                <AlignRight className="w-4 h-4 text-neutral-100" />
              </button>
            </div>

            <style>{moveableStyles}</style>
            <Moveable
              key={moveableKey}
              target={imageRef.current}
              container={null}
              origin={false}
              edge={false}
              throttleDrag={0}
              keepRatio={false}
              resizable={true}
              throttleResize={0}
              renderDirections={["nw", "ne", "sw", "se"]}
              onResize={({ target, width }) => {
                const { margin } = getCurrentStyles();
                target.style.cssText = `width: ${width}px; height: auto; margin: ${margin};`;
              }}
              onResizeEnd={({ target }) => {
                const width = parseInt(target.style.width);
                updateMediaSize(width);
              }}
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export const TiptapImage = Node.create<ImageOptions>({
  name: "image",

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? "inline" : "block";
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
      style: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
        getAttrs: (element) => {
          if (typeof element === "string") {
            return false;
          }

          const img = element as HTMLImageElement;

          return {
            src: img.getAttribute("src"),
            alt: img.getAttribute("alt"),
            title: img.getAttribute("title"),
            width: img.getAttribute("width"),
            height: img.getAttribute("height"),
            style: img.getAttribute("style"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", HTMLAttributes];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent);
  },
});

export default TiptapImage;
