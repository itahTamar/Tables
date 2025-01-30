import React, { forwardRef } from "react";

interface SelectionMenuProps {
  x: number; 
  y: number;
  children: React.ReactNode;
}

const SelectionMenu = forwardRef<HTMLDivElement, SelectionMenuProps>(({ x, y, children }, ref) => {
  const menuHeight = 250; // Estimated height of the menu in pixels
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
    </div>
  );
});

export default SelectionMenu;
