import React from "react";

export const DragArea = () => {
  const handleMouseDown = (e) => {
    if (e.button === 0) {
      window.electron.ipcRenderer.invoke("startDrag");
    }
  };

  return (

        <div
          className="w-full fixed h-4 bg-inherit z-50"
          onMouseDown={handleMouseDown}
          style={{
            WebkitAppRegion: "drag",
            userSelect: "none",
          }}>
          <div
            className=" w-full mt-10 h-5 items-center flex bg-inherit"
            onMouseDown={handleMouseDown}
            style={{
              WebkitAppRegion: "drag",
              userSelect: "none",
            }}>
          </div>
        </div>

  );
};

