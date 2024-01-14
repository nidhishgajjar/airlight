import React, { useContext, useState, useEffect, useRef, useCallback } from "react";
// import FetchContext from "../contexts/fetch";
import SearchContext from "../contexts/search";
import LangInterfaceContext from "../contexts/langfacecontext";
import Modal from "react-modal";
import {
  FaHome,
  FaArrowLeft,
  FaArrowRight,
  FaRedo,
  FaSearch,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";

Modal.setAppElement("#root");

export const LangFace = ({ enterUserInput, setEnterUserInput }) => {
  const { langInterfaceVisible, setLangInterfaceVisible, changeShortcutVisible } =
    useContext(LangInterfaceContext);

  const [input, setInput] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [webViewLoading, setWebViewLoading] = useState(true);
  const [webviewSrc, setWebviewSrc] = useState("https://google.com");
  const webviewRef = useRef(null);

  const {
    loading,
    setLoading,
  } = useContext(SearchContext);

  const handleHomeClick = () => {
    setLangInterfaceVisible(false);
    setWebViewLoading(true);
    setEnterUserInput("");
  };

  const handleClearAll = () => {
    setInput("");
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && loading === false && input) {
      event.preventDefault();
      setWebviewSrc(`https://google.com/search?q=${encodeURIComponent(input)}`);
      openModal();
    }
  };


  const handleBackClick = () => {
    if (webviewRef.current && webviewRef.current.canGoBack()) {
      webviewRef.current.goBack();
    }
  };
  
  const handleForwardClick = () => {
    if (webviewRef.current && webviewRef.current.canGoForward()) {
      webviewRef.current.goForward();
    }
  };


  const reloadWebview = () => {
    if (webviewRef.current) {
      webviewRef.current.reload();
      setWebViewLoading(true);
    }
  };

  const clickButton = useCallback(() => {
    setTimeout(async () => {
      try {
        const clickButtonScript = `
      const button = document.querySelector('button.absolute.p-1.rounded-md');
      button.click();
    `;

        if (webviewRef.current) {
          try {
            await webviewRef.current.executeJavaScript(clickButtonScript);
          } catch (error) {
            console.error("Error executing script in webview:", error);
          }
        }
      } catch (error) {
        console.error(error);
      }
    }, 500);
  }, [webviewRef])


  const injectEnterKeyListener = useCallback(async () => {
    const selector = 'textarea[placeholder="Message ChatGPT..."]';
    const enterKeyListenerScript = `
      document.addEventListener('keydown', (event) => {
        const textarea = document.querySelector('${selector}');
        const textareaValue = textarea.value.trim();

        if (event.key === 'Enter' && event.shiftKey) {
          event.preventDefault();
          const cursorPosition = textarea.selectionStart;
          const textBeforeCursor = textarea.value.substring(0, cursorPosition);
          const textAfterCursor = textarea.value.substring(cursorPosition);
          textarea.value = textBeforeCursor + '\\n' + textAfterCursor;
          textarea.selectionStart = textarea.selectionEnd = cursorPosition + 1;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          const button = document.querySelector('button.absolute.p-1.rounded-md');
          button.click();
          textarea.value = '';
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    `;

    if (webviewRef.current) {
      try {
        await webviewRef.current.executeJavaScript(enterKeyListenerScript);
      } catch (error) {
        console.error("Error executing script in webview:", error);
      }
    }
  }, [webviewRef]);

  const langInterfaceAsk = useCallback (async (shiftEnterUserInput) => {
    if (shiftEnterUserInput) {
      // Replace 'selector' with the appropriate CSS selector for the third-party website's input field
      const selector = 'textarea[placeholder="Message ChatGPT..."]';

      const setInputValueScript = `
      document.querySelector('${selector}').value = \`${shiftEnterUserInput.replace(
        /`/g,
        "\\`"
      )}\`;

      document.querySelector('${selector}').dispatchEvent(new Event('input', { bubbles: true }));
    `;

      if (webviewRef.current) {
        try {
          await webviewRef.current.executeJavaScript(setInputValueScript);
          await clickButton();
        } catch (error) {
          console.error("Error executing script in webview:", error);
        }
      }
    }
  }, [webviewRef, clickButton])

  const setupWebViewListeners = useCallback (() => {
    if (webviewRef.current) {
      webviewRef.current.addEventListener("did-finish-load", () => {
        setWebViewLoading(false);
        langInterfaceAsk(enterUserInput);
        injectEnterKeyListener();
      });

      webviewRef.current.addEventListener("did-fail-load", () => {
        setWebViewLoading(true);
      });
    }
  }, [webviewRef, langInterfaceAsk, setWebViewLoading, injectEnterKeyListener, enterUserInput]);


  useEffect(() => {
    setupWebViewListeners();
  }, [setupWebViewListeners, langInterfaceVisible]);

  function openModal() {
    setModalIsOpen(true);
  }

  function closeModal() {
    setModalIsOpen(false);
  }

  return (
    <div className="w-full h-full flex flex-col font-helvetica-neue">
      {langInterfaceVisible && changeShortcutVisible === false && (
        <div className="w-full h-full">
          <div className="h-14 w-full bg-neutral-200 dark:bg-neutral-900 flex justify-around items-center fixed">
            <button className="active:scale-95" onClick={handleHomeClick}>
              <FaHome className="text-neutral-500 h-5 w-5" />
            </button>
            <button className="active:scale-95" onClick={reloadWebview}>
              <FaRedo className="text-neutral-500 " />
            </button>
            <a
              href="https://chat.openai.com/?model=gpt-4"
              target="_blank"
              rel="noreferrer"
              className="dark:text-neutral-400 text-neutral-500">
              chat.openai.com
            </a>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 z-50 flex items-center">
                <FaSearch className="dark:text-neutral-500 text-neutral-300" />
              </div>
              <input
                type="text"
                onKeyDown={handleKeyDown}
                value={input}
                onChange={handleInputChange}
                className="dark:text-neutral-300 text-neutral-500 placeholder:text-neutral-300 placeholder:dark:text-neutral-500 dark:bg-neutral-700 outline-none rounded-lg w-64 pl-9 pr-10"
                placeholder="quick web search"
              />
              <div className="absolute inset-y-0 right-0 pr-3 active:scale-95 flex items-center">
                <button className="outline-none" onClick={handleClearAll}>
                  <FaTimes className="dark:text-neutral-500 text-neutral-300" />
                </button>
              </div>
            </div>

            <Modal
              isOpen={modalIsOpen}
              onRequestClose={closeModal}
              contentLabel="Web Results Modal"
              className="rounded dark:bg-neutral-700 bg-neutral-200 p-10 h-full w-full border-none outline-none"
            >
              <div className="flex justify-between items-center pb-5 rounded-lg dark:bg-neutral-800 bg-slate-100">

              <div className="flex justify-between items-center space-x-10 pt-4 ml-10">
                <button className="active:scale-95" onClick={handleBackClick}>
                  <FaArrowLeft className="text-neutral-500 h-5 w-5" />
                </button>
                <button className="active:scale-95" onClick={handleForwardClick}>
                  <FaArrowRight className="text-neutral-500 h-5 w-5 " />
                </button>
              </div>
                <button
                  className="mt-5 mr-5 px-2 rounded-md text-neutral-50 text-base bg-red-500"
                  onClick={closeModal}>
                  Close
                </button>
              </div>
              <div className="rounded-lg overflow-hidden h-full mt-5">
                <webview
                  ref={webviewRef}
                  src={webviewSrc}
                  className="w-full h-full"
                  allowpopups="true"
                />
              </div>
            </Modal>
          </div>
          {webViewLoading && (
            <div className="top-25 w-full h-full flex items-center justify-center bg-opacity-50 bg-black">
              <FaSpinner className="text-4xl text-neutral-600 animate-spin" />
            </div>
          )}

          <div className="w-full h-full pt-14 z-50">
            <webview
              ref={webviewRef}
              src="https://chat.openai.com/?model=gpt-4"
              className="w-full h-full"
              allowpopups="true"
            />
          </div>
        </div>
      )}
    </div>
  );
};
