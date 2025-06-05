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

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          onPasteImage?.(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

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
          <>
            <textarea
              placeholder="📋 Paste here (Tablet/Desktop)"
              onPaste={(e) => {
                const items = e.clipboardData.items;
                let foundImage = false;

                for (const item of items) {
                  if (item.type.startsWith("image/")) {
                    const file = item.getAsFile();
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        onPasteImage?.(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                      foundImage = true;
                      break;
                    }
                  }
                }

                if (!foundImage) {
                const text = e.clipboardData.getData("text");

                if (text) {
                  onPasteText?.(text);
                } else {
                  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
                  if (isMobile) {
                    const input = document.getElementById("hiddenFileInput") as HTMLInputElement;
                    alert("📷 Pasting screenshots is not supported on this device. Please select the screenshot manually.");
                    input?.click();
                  }
                }
              }

                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer?.files?.[0];
                if (file && file.type.startsWith("image/")) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    onPasteImage?.(reader.result as string);
                  };
                  reader.readAsDataURL(file);
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

            {/* Hidden image file input for mobile paste fallback */}
            <input
              type="file"
              accept="image/*"
              id="hiddenFileInput"
              style={{ display: "none" }}
              onChange={handleFileInputChange}
            />
          </>
        )}
      </div>
    );
  }
);

export default SelectionMenu;
