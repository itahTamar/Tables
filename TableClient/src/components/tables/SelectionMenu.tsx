import React, { forwardRef } from "react";

interface SelectionMenuProps {
  x: number; 
  y: number;
  children: React.ReactNode;
  showPasteHelper?: boolean;
  onPasteText?: (text: string) => void;
  onPasteImage?: (dataUrl: string) => void;
}

const SelectionMenu = forwardRef<HTMLDivElement, SelectionMenuProps>(
  ({ x, y, children, showPasteHelper, onPasteText, onPasteImage }, ref) => {
    const menuHeight = 250;
    const viewportHeight = window.innerHeight;
    const adjustedY = y + menuHeight > viewportHeight ? y - menuHeight : y;

    return (
      <div
        ref={ref}
        className="selection-menu"
        style={{
          position: "absolute",
          top: adjustedY,
          left: x,
          background: "#fff",
          border: "1px solid #ccc",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          zIndex: 1000,
          padding: "10px",
        }}
      >
        {children}
        {showPasteHelper && (
          <textarea
            placeholder="📋 Paste here (Tablet Support)"
            onPaste={(e) => {
              const text = e.clipboardData.getData("text");
              const items = e.clipboardData.items;

              for (const item of items) {
                if (item.type.startsWith("image/")) {
                  const file = item.getAsFile();
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      onPasteImage?.(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                  e.preventDefault();
                  return;
                }
              }

              if (text) {
                onPasteText?.(text);
              }
            }}
            style={{
              minHeight: "4rem",
              width: "100%",
              marginTop: "0.5rem",
              border: "1px dashed gray",
              fontSize: "0.9rem",
              padding: "0.5rem",
            }}
          />
        )}
      </div>
    );
  }
);

export default SelectionMenu;
