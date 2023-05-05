import React, { useState, createContext, useEffect } from "react";

const LangInterfaceContext = createContext();

export const LangInterfaceProvider = ({ children }) => {
  const [langInterfaceVisible, setLangInterfaceVisible] = useState(true);
  const [quickSearchVisible, setQuickSearchVisible] = useState(false);
  const [changeShortcutVisible, setChangeShortcutVisible] = useState(false);
  return (
    <LangInterfaceContext.Provider
      value={{
        langInterfaceVisible,
        setLangInterfaceVisible,
        quickSearchVisible,
        setQuickSearchVisible,
        changeShortcutVisible,
        setChangeShortcutVisible,
      }}>
      {children}
    </LangInterfaceContext.Provider>
  );
};

export default LangInterfaceContext;


