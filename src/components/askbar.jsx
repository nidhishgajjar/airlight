import React, { useState, useContext, useEffect } from "react";
import SearchContext from "../contexts/search";
import FetchContext from "../contexts/fetch";
import LangInterfaceContext from "../contexts/langfacecontext";
import { LangFace } from "./langface";

export const AskBar = () => {
  const { langInterfaceVisible, setLangInterfaceVisible } =
    useContext(LangInterfaceContext);

  const {
    userInput,
    handleInput,
    handleClick,
    inputRef,
    allSearchPrompts,
    handleClearClick,
    setUserInput,
  } = useContext(SearchContext);
  const { loading } = useContext(FetchContext);
  const [shiftEnterUserInput, setShiftEnterUserInput] = useState("");
  const ipcRenderer = window.electron ? window.electron.ipcRenderer : null;

  const handleClickLangInterface = () => {
    setLangInterfaceVisible(true);
  };

  const adjustTextAreaHeight = (textarea) => {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";

    const maxHeight = parseInt(getComputedStyle(textarea).maxHeight, 10);
    if (textarea.scrollHeight < maxHeight && allSearchPrompts.length === 0) {
      if (ipcRenderer) {
        ipcRenderer.send("textarea-height-changed", textarea.scrollHeight);
      }
    } else if (
      textarea.scrollHeight > maxHeight &&
      allSearchPrompts.length === 0
    ) {
      if (ipcRenderer) {
        ipcRenderer.send("textarea-height-changed", maxHeight);
      }
    }
  };

  const handleInputWithAdjustment = (e) => {
    handleInput(e);
    adjustTextAreaHeight(e.target);
  };

  useEffect(() => {
    if (window.electron) {
      window.electron.ipcRenderer.send(
        "quickSearchRequested",
        allSearchPrompts.length >= 1
      );
      window.electron.ipcRenderer.send(
        "showLangInterface",
        langInterfaceVisible === true
      );
    }
  }, [allSearchPrompts, langInterfaceVisible]);

  const handleKeyDown = async (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.getModifierState("Meta") &&
      loading === false &&
      userInput
    ) {
      event.preventDefault();
      handleClick();
    }
    if (event.key === "Enter" && event.getModifierState("Meta")) {
      event.preventDefault();
      handleClearClick();
      handleClickLangInterface();
      setShiftEnterUserInput(userInput);
    }
    if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      const newInput = userInput + "\n";
      setUserInput(newInput);
      setTimeout(() => {
        adjustTextAreaHeight(inputRef.current);
      }, 0);
    }
  };

  return (
    <div className="flex flex-col h-screen" onKeyDown={handleKeyDown}>
      {langInterfaceVisible === false && (
        <div>
          <textarea
            ref={inputRef}
            rows="1"
            autoFocus
            placeholder="Ask Chad - 'dare to imagine'"
            value={userInput}
            onChange={handleInputWithAdjustment}
            className="w-full px-3 py-2 opacity-90 z-10 absolute bg-neutral-300 placeholder:text-neutral-500 text-neutral-800 dark:bg-neutral-800 placeholder:dark:text-neutral-500 dark:text-neutral-100 text-xl font-helvetica-neue outline-none tracking-wider resize-none overflow-auto max-h-96"
            style={{ lineHeight: "1.5" }}
          />
        </div>
      )}
      <LangFace shiftEnterUserInput={shiftEnterUserInput} />
    </div>
  );
};
