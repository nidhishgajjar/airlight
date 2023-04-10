import React, { useState, createContext } from "react";

const LangInterfaceContext = createContext();

export const LangInterfaceProvider = ({ children }) => {
  const [langInterfaceVisible, setLangInterfaceVisible] = useState(false);
  return (
    <LangInterfaceContext.Provider
      value={{
        langInterfaceVisible,
        setLangInterfaceVisible,
      }}>
      {children}
    </LangInterfaceContext.Provider>
  );
};

export default LangInterfaceContext;
