import React, { useContext } from "react";
import LangInterfaceContext from "../contexts/langfacecontext";

export const DragArea = () => {
  const {quickSearchVisible } = useContext(LangInterfaceContext);
  const handleMouseDown = (e) => {
    if (e.button === 0) {
      window.electron.ipcRenderer.invoke("startDrag");
    }
  };

  return (
    <>
      {quickSearchVisible === false && (
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
      )}

      {quickSearchVisible && (
        <>
          <div
          className="w-full fixed h-10 mt-16 bg-inherit z-50"
          onMouseDown={handleMouseDown}
          style={{
            WebkitAppRegion: "drag",
            userSelect: "none",
          }}>
        </div>

        <div
          className="w-full fixed h-7 bg-inherit z-50"
          onMouseDown={handleMouseDown}
          style={{
            WebkitAppRegion: "drag",
            userSelect: "none",
          }}>
        </div>

        <div
          className="w-5 fixed h-full bg-inherit z-50"
          onMouseDown={handleMouseDown}
          style={{
            WebkitAppRegion: "drag",
            userSelect: "none",
          }}>
        </div>


        <div
          className="w-5 right-0 fixed h-full bg-inherit z-50"
          onMouseDown={handleMouseDown}
          style={{
            WebkitAppRegion: "drag",
            userSelect: "none",
          }}>
        </div>
      </>
      )}
    </>
  );
};

