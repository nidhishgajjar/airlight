import React, { useContext, useRef, useState, useEffect } from "react";
import LangInterfaceContext from "../contexts/langfacecontext";
import SearchContext from "../contexts/search";
import {
  FaArrowLeft,
  FaArrowRight,
  FaHome,
  FaSync
} from "react-icons/fa";


export const AppWindow = ({ googleSearch, setGoogleSearch, activeApp, tabs, setTabs, activeTab, setActiveTab  }) => {
  const {changeShortcutVisible, quickSearchVisible, setQuickSearchVisible } = useContext(LangInterfaceContext);

  const {
    handleClearClick,
  } = useContext(SearchContext);

  const fixedTabs = [`https://www.google.com/search?q=${encodeURIComponent(googleSearch)}`, 'https://chat.openai.com'];
  const webviewRefs = useRef({});

  useEffect(() => {
    // Update the Google search tab with the new search query instead of adding a new tab
    let newTabs = tabs.map(tab => {
      if (tab.startsWith('https://www.google.com/search?q=')) {
        return `https://www.google.com/search?q=${encodeURIComponent(googleSearch)}`;
      }
      return tab;
    });
  
    // Add fixed tabs to the tabs array if they're not already there
    fixedTabs.forEach(tab => {
      if (!newTabs.includes(tab)) {
        newTabs.push(tab);
      }
    });
    setTabs(newTabs);
  }, [googleSearch, tabs]);  // <-- Add googleSearch as a dependency



  useEffect(() => {
    const currentWebview = webviewRefs.current[activeTab];
    if (currentWebview) {
      currentWebview.addEventListener('did-navigate', (e) => {
        const newTabUrl = e.url;
        // Update the favicon
        const faviconUrl = `https://www.google.com/s2/favicons?sz=16&domain=${newTabUrl}`;
        // Update the state or DOM with the new favicon URL
      });
    }
  }, [activeTab]);

  

  useEffect(() => {
    if (activeApp && !tabs.includes(activeApp)) {
      setTabs(prevTabs => [...prevTabs, activeApp]);
      setActiveTab(activeApp);
    }
  }, [activeApp, tabs]);  // <-- also added tabs as dependency
  


  const handleHomeClick = () => {
    setQuickSearchVisible(false);
    setGoogleSearch("");
    handleClearClick();
  };

  const handleBackClick = () => {
    const currentWebview = webviewRefs.current[activeTab];
    if (currentWebview && currentWebview.canGoBack()) {
      currentWebview.goBack();
    }
  };
  
  const handleReloadClick = () => {
    const currentWebview = webviewRefs.current[activeTab];
    if (currentWebview) {
      currentWebview.reload();
    }
  };
  
  const handleForwardClick = () => {
    const currentWebview = webviewRefs.current[activeTab];
    if (currentWebview && currentWebview.canGoForward()) {
      currentWebview.goForward();
    }
  };
  


  return (
    <div className="fixed flex flex-col w-full h-full p-5 md:px-5 py-5">
      {quickSearchVisible && !changeShortcutVisible && (
        <div className="flex flex-col h-full">
          
          <div className="flex items-center justify-between mb-5 rounded-lg dark:bg-neutral-800 bg-slate-100">

              <div className="flex justify-between items-center space-x-10 py-3 ml-10">
                <button className="active:scale-95" onClick={handleHomeClick}>
                  <FaHome className="text-neutral-500 h-5 w-5" />
                </button>
                <button className="active:scale-95" onClick={handleBackClick}>
                  <FaArrowLeft className="text-neutral-500 h-5 w-5" />
                </button>
                <button className="active:scale-95" onClick={handleForwardClick}>
                  <FaArrowRight className="text-neutral-500 h-5 w-5 " />
                </button>
                <button className="active:scale-95" onClick={handleReloadClick}>
                  <FaSync className="text-neutral-500 h-4 w-4 " />
                </button>
                {tabs.map((tabUrl) => (
                    <button 
                        key={tabUrl} 
                        onClick={() => setActiveTab(tabUrl)} 
                        className={`tab-btn ${activeTab === tabUrl ? 'active' : ''}`}>
                        <img src={`https://www.google.com/s2/favicons?sz=16&domain=${tabUrl}`} alt="" />
                    </button>
                ))}

              </div>
              </div>
              <div className="flex-grow relative rounded-lg overflow-hidden" style={{height: '100%'}}>
              {tabs.map((tabUrl) => (
                  <div 
                    key={tabUrl} 
                    className={`absolute inset-0 w-full h-full ${activeTab === tabUrl ? 'block' : 'hidden'} rounded-lg overflow-hidden`}
                  >
                    <webview
                      ref={el => webviewRefs.current[tabUrl] = el}
                      src={tabUrl}
                      className="w-full h-full"
                      allowpopups="true"
                    />
                  </div>
                  ))}

                </div>

          </div>
      )}
    </div>
  );
};
