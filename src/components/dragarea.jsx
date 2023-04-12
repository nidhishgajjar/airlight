import React from "react";

export const DragArea = () => {
  const handleMouseDown = (e) => {
    if (e.button === 0) {
      window.electron.ipcRenderer.invoke("startDrag");
    }
  };

  return (
    <div
      className="w-full fixed h-3 z-50"
      onMouseDown={handleMouseDown}
      style={{
        WebkitAppRegion: "drag",
        userSelect: "none",
      }}></div>
  );
};

