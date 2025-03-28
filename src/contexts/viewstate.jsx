import React, { useState, createContext, useEffect } from "react";

export const ViewStateContext = createContext();

export const ViewStateProvider = ({ children }) => {
  const [activeView, setActiveView] = useState('none'); // 'none', 'aiAgent', 'browser'
  const [currentQuery, setCurrentQuery] = useState('');

  useEffect(() => {
    if (window.electron) {
      switch (activeView) {
        case 'browser':
          window.electron.ipcRenderer.send("browserRequested", true);
          break;
        case 'aiAgent':
          window.electron.ipcRenderer.send("aiAgentRequested", true);
          break;
        case 'none':
          // Always reset to search dimensions when going back to search
          window.electron.ipcRenderer.send("reset-to-search");
          break;
      }
    }
  }, [activeView]);

  const handleKeyCommand = (event, query) => {
    if (event.key === 'Enter') {
      if (event.metaKey) { // Command+Enter
        setActiveView('browser');
        setCurrentQuery(query);
      } else { // Just Enter
        setActiveView('aiAgent');
        setCurrentQuery(query);
      }
    }
  };

  return (
    <ViewStateContext.Provider
      value={{
        activeView,
        setActiveView,
        currentQuery,
        setCurrentQuery,
        handleKeyCommand
      }}>
      {children}
    </ViewStateContext.Provider>
  );
};

export default ViewStateContext;


