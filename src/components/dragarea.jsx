import React, { useState } from "react";

export const DragArea = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsDragging(true);
      setOffset({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newPosition = {
        x: e.screenX - offset.x,
        y: e.screenY - offset.y,
      };
      window.electron.ipcRenderer.send("moveWindow", newPosition);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  return (
    <div
      className="w-full z-50"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}></div>
  );
};
