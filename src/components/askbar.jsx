import React, { useState, useContext, useEffect } from "react";
import LangInterfaceContext from "../contexts/langfacecontext";
import SearchContext from "../contexts/search";
import EditAppModal from './editappmodal';
import './askbar.css';

import { LangFace } from "./langface";
import { AppWindow } from "./appwindow";


export const AskBar = () => {
  const { langInterfaceVisible, setLangInterfaceVisible, quickSearchVisible, setQuickSearchVisible, changeShortcutVisible } =
    useContext(LangInterfaceContext);

  const {
    userInput,
    handleInput,
    handleClearClick,
  } = useContext(SearchContext);
  const [enterUserInput, setEnterUserInput] = useState("");
  const [googleSearch, setGoogleSearch] = useState(false);
  const ipcRenderer = window.electron ? window.electron.ipcRenderer : null;
  const [failedImages, setFailedImages] = useState({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [apps, setApps] = useState(() => {
    const localData = localStorage.getItem('apps');
    const parsedData = localData ? JSON.parse(localData) : [
      
        { url: 'https://chat.openai.com'},
        { url: 'https://claude.ai/chats'},
        { url: 'https://notion.so'},
        { url: 'https://twitter.com'},
        { url: 'https://youtube.com'},
        { url: 'https://myreader.ai'},
        { url: 'https://mail.google.com'},
        { url: 'https://vercel.com'},
        { url: 'https://stripe.com'},
        { url: 'https://github.com'},

    ];
    return parsedData;
  });

  const [loadedApps, setLoadedApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appContent, setAppContent] = useState({}); // { 'https://notion.so': null, ... }
  const [activeApp, setActiveApp] = useState(null);
  const [tabs, setTabs] = useState([]); 
  const [activeTab, setActiveTab] = useState(null);



  useEffect(() => {
    // Filter out apps with empty URLs
    const filteredApps = apps.filter(app => app.url && app.url.trim() !== '');
  
    localStorage.setItem('apps', JSON.stringify(filteredApps));
  }, [apps]);
  

  useEffect(() => {
    (async () => {
      const newApps = await Promise.all(apps.map(async (app) => {
        const favicon = await getFavicon(app.url);
        return { ...app, image: favicon || null };
      }));
      setLoadedApps(newApps);
      setLoading(false);
    })();
  }, [apps]); // Add apps as a dependency

  const handleClickLangInterface = () => {
    setLangInterfaceVisible(true);
  };


  const getFavicon = (url) => {
    return `https://www.google.com/s2/favicons?sz=32&domain=${url}`;
  };

  const adjustTextAreaHeight = (textarea) => {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";

    const maxHeight = parseInt(getComputedStyle(textarea).maxHeight, 10);
    if (textarea.scrollHeight < maxHeight) {
      if (ipcRenderer) {
        ipcRenderer.send("textarea-height-changed", textarea.scrollHeight);
      }
    } else if (
      textarea.scrollHeight > maxHeight
    ) {
      if (ipcRenderer) {
        ipcRenderer.send("textarea-height-changed", maxHeight);
      }
    }
  };

  const handleEditClick = () => {
    setEditModalVisible(true);
    setLangInterfaceVisible(false);
    setQuickSearchVisible(false);
    
    if(ipcRenderer) {
      ipcRenderer.send('increase-window-height');
    }
  };
  
  

  const handleInputWithAdjustment = (e) => {
    handleInput(e);
    adjustTextAreaHeight(e.target);
  };

  useEffect(() => {
    if (window.electron) {
      if (langInterfaceVisible === false) {
         window.electron.ipcRenderer.send(
        "quickSearchRequested",
        quickSearchVisible === true
      );
      }
        window.electron.ipcRenderer.send(
          "showLangInterface",
          langInterfaceVisible === true
        );
    }
  }, [langInterfaceVisible, quickSearchVisible]);
  
  const handleAppClick = (app) => {
    if (!appContent[app.url]) {
        setAppContent(prev => ({ ...prev, [app.url]: app.url }));
    }
    setActiveApp(app.url);
    setQuickSearchVisible(true);
    
    // Add a tab for the clicked app if it's not already opened
    if(!tabs.includes(app.url)) {
        setTabs(prevTabs => [...prevTabs, app.url]);
        setActiveTab(app.url);  // Set the clicked app as the active tab
    }

    setActiveTab(app.url);
};


  

  const handleKeyDown = async (event) => {
    if (
      event.key === "Enter" &&
      !event.getModifierState("Alt") &&
      userInput &&
      quickSearchVisible === false &&
      changeShortcutVisible === false &&
      editModalVisible === false
    ) {
      event.preventDefault();

      if (userInput) { // If there's user input, load it into Google search in the fixed tab
        setQuickSearchVisible(true);
        setGoogleSearch(userInput);
        setActiveTab(`https://www.perplexity.ai/search?q=${encodeURIComponent(userInput)}&focus=internet`); 
      } else { // If there's no user input, just make quickSearchVisible true
        setQuickSearchVisible(true);
      }
    }
     if (
       event.key === "Enter" &&
       !event.shiftKey &&
       event.getModifierState("Alt") &&
       quickSearchVisible === true &&
       userInput && 
       changeShortcutVisible === false &&
       editModalVisible === false
     ) {
       event.preventDefault();
       
       setQuickSearchVisible(true);
       setEnterUserInput(userInput);
     }
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      event.getModifierState("Alt") &&
      quickSearchVisible === false &&
      changeShortcutVisible === false &&
      editModalVisible === false
    ) {
      event.preventDefault();
      handleClearClick();
      handleClickLangInterface();
      setEnterUserInput(userInput);
    }
  };


  return (
    <div className="flex flex-col h-screen " onKeyDown={handleKeyDown}>
      {langInterfaceVisible === false && changeShortcutVisible === false && quickSearchVisible === false && editModalVisible == false && (
        <>
          <div>
            <textarea
              rows="1"
              autoFocus
              placeholder="Airlight - ask anything"
              value={userInput}
              onChange={handleInputWithAdjustment}
              className="custom-scrollbar w-full px-3 py-1 opacity-90  absolute bg-neutral-300 placeholder:text-neutral-500 text-neutral-800 dark:bg-neutral-800 placeholder:dark:text-neutral-500 dark:text-neutral-100 text-xl font-helvetica-neue outline-none tracking-wider resize-none overflow-auto max-h-96"
              style={{ lineHeight: "2" }}
            />
          </div>
          <div className="custom-scrollbar flex overflow-x-scroll mt-16 px-1 whitespace-nowrap">
          {!loading && loadedApps
              .filter(app => app.url.trim() !== '') 
              .map((app, index) => (
              <button
                key={index}
                onClick={() => handleAppClick(app)}
                className="flex items-center justify-center w-12 h-12 mx-4 rounded-full bg-neutral-200  dark:bg-neutral-600 text-white flex-shrink-0"
              >
                {!failedImages[app.url] && app.image ? 
                  <img 
                    src={app.image} 
                    alt={app.name} 
                    style={{ borderRadius: '5px' }} 
                    onError={(e) => {
                      setFailedImages(prev => ({
                        ...prev,
                        [app.url]: true
                      }));
                    }}
                  /> 
                  : 
                  <span>{app.name ? app.name[0].toUpperCase() : 'N/A'}</span>
                }
              </button>
            ))}
            <button
              onClick={handleEditClick}
              className="flex items-center justify-center w-12 h-12 mx-4 rounded-full bg-neutral-600 text-white flex-shrink-0"
            >
              <span>Edit</span>
            </button>
          </div>
        </>
      )}

      {editModalVisible && (
        <EditAppModal apps={apps} setApps={setApps} onClose={() => setEditModalVisible(false)} />
      )}


      {!langInterfaceVisible && changeShortcutVisible === false && quickSearchVisible === true && (
        <AppWindow
          googleSearch={googleSearch}
          setGoogleSearch={setGoogleSearch}
          activeApp={activeApp}
          tabs={tabs}
          setTabs={setTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />  
      )}
      {
        langInterfaceVisible && changeShortcutVisible === false && quickSearchVisible === false && (
          <LangFace
          enterUserInput={enterUserInput}
          setEnterUserInput={setEnterUserInput}
        />
        )
      }
    </div>
  );

};
