import React, { useContext, useState, useEffect, useRef, useCallback } from "react";
import FetchContext from "../contexts/fetch";
import LangInterfaceContext from "../contexts/langfacecontext";
import Modal from "react-modal";
import {
  FaArrowLeft,
  FaRedo,
  FaSearch,
  FaTimes,
  FaPlus,
  FaSpinner,
} from "react-icons/fa";

Modal.setAppElement("#root");

export const LangFace = ({ shiftEnterUserInput, setShiftEnterUserInput }) => {
  const { langInterfaceVisible, setLangInterfaceVisible, changeShortcutVisible } =
    useContext(LangInterfaceContext);

  const [input, setInput] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [webViewLoading, setWebViewLoading] = useState(true);
  const webviewRef = useRef(null);

  const {
    loading,
    setLoading,
    questionsLoading,
    langInterfaceQuestions,
    setQuestionsLoading,
    setStreamCompleted,
    fetchResponse,
    fetchSearchResults,
    langInterfaceResponse,
    setLangInterfaceResponse,
    langInterfaceWebSearch,
    setLangInterfaceWebSearch,
    streamCompleted,
  } = useContext(FetchContext);

  const formattedResponse = langInterfaceResponse
    .split("\n")
    .map((step, index) => <ul key={index}>{step}</ul>);

  const handleBackArrowClick = () => {
    setLangInterfaceVisible(false);
    setWebViewLoading(true);
    setShiftEnterUserInput("");
  };

  const handleClearAll = () => {
    setInput("");
    setLangInterfaceResponse("");
    setLangInterfaceWebSearch("");
    setShowResponse(false);
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleQuickSearch = async (query) => {
    try {
      setLoading(true);
      setQuestionsLoading(true);
      setShowResponse(true);

      setStreamCompleted(true);
      setLangInterfaceResponse("");

      await fetchResponse(query);
      await fetchSearchResults(query);
    } catch (error) {
      console.error(error);
      setLangInterfaceResponse("Error generating a response");
      setLoading(false);
      setStreamCompleted(false);
    }
  };

  const handleQuery = async (input) => {
    handleQuickSearch(input);
  };

  const handleQuestionClick = (results) => {
    setInput(results);
    handleQuickSearch(results);
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
      const button = document.querySelector('button.absolute.p-1.rounded-md.text-gray-500');
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

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && loading === false && input) {
      event.preventDefault();
      handleQuery(input);
    }
  };

  const injectEnterKeyListener = useCallback(async () => {
    const selector = 'textarea[placeholder="Send a message."]';
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
          const button = document.querySelector('button.absolute.p-1.rounded-md.text-gray-500');
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
      const selector = 'textarea[placeholder="Send a message."]';

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
        langInterfaceAsk(shiftEnterUserInput);
        injectEnterKeyListener();
      });

      webviewRef.current.addEventListener("did-fail-load", () => {
        setWebViewLoading(true);
      });
    }
  }, [webviewRef, langInterfaceAsk, setWebViewLoading, injectEnterKeyListener, shiftEnterUserInput]);


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
            <button className="active:scale-95" onClick={handleBackArrowClick}>
              <FaArrowLeft className="text-neutral-500" />
            </button>
            <button className="active:scale-95" onClick={reloadWebview}>
              <FaRedo className="text-neutral-500" />
            </button>
            <a
              href="https://ai.com"
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
            {showResponse && (
              <div
                className="h-96 absolute overflow-y-auto rounded-2xl bg-neutral-100 dark:bg-neutral-800 top-16"
                style={{ width: "500px" }}>
                <div>
                  <div>
                    {loading === false && (
                      <div className="flex px-5">
                        <button
                          className="text-sm mt-4 bg-neutral-200 dark:bg-neutral-700 text-slate-700 dark:text-neutral-400 rounded-full pl-3 pr-3 pt-1 pb-1 outline-none hover:bg-sky-100 dark:hover:bg-neutral-600 active:scale-90 whitespace-nowrap"
                          style={{ width: "500px" }}
                          onClick={() => openModal()}>
                          View Sources
                        </button>
                      </div>
                    )}
                    {loading && (
                      <div className="pt-5 px-7 w-full">
                        <div className="outline-none bg-slate-300 dark:bg-neutral-100 rounded-md p-3 animate-pulse"></div>
                      </div>
                    )}
                    <p className="py-3 pl-6 pr-3 overflow-y-auto text-base text-neutral-600 dark:text-neutral-300">
                      {formattedResponse}
                    </p>
                    {streamCompleted && (
                      <div className="pt-7 px-7 w-full">
                        <div className="outline-none bg-slate-300 dark:bg-neutral-100  rounded-md p-5 animate-pulse"></div>
                        <div className="outline-none bg-slate-300 dark:bg-neutral-100  rounded-md p-5 mt-4 animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>
                {questionsLoading === false && (
                  <div className="flex flex-col pb-16 pt-2 space-y-4 px-7">
                    {langInterfaceQuestions.map((results, index) => (
                      <button
                        key={index}
                        className="bg-transparent text-left outline-none border hover:bg-sky-50 dark:hover:bg-neutral-600 active:scale-95 border-neutral-400 dark:border-gray-200 border-opacity-30 dark:border-opacity-20 text-neutral-500 dark:text-neutral-400 rounded-xl px-3 py-1 text-sm whitespace items-center flex"
                        onClick={() =>
                          handleQuestionClick(results.replace(/"/g, ""))
                        }>
                        <FaPlus className="mr-2 h-3 text-neutral-400 text-opacity-50 dark:text-neutral-400" />{" "}
                        {results.replace(/"/g, "")}
                      </button>
                    ))}
                  </div>
                )}
                {questionsLoading && loading === false && (
                  <div className="pt-5 px-7 w-full">
                    <div className="outline-none bg-slate-300 dark:bg-neutral-100 rounded-md p-5 animate-pulse"></div>
                    <div className="outline-none bg-slate-300 dark:bg-neutral-100 rounded-md p-5 mt-4 animate-pulse"></div>
                    <div className="outline-none bg-slate-300 dark:bg-neutral-100 rounded-md p-5 mt-4 animate-pulse"></div>
                  </div>
                )}
              </div>
            )}

            <Modal
              isOpen={modalIsOpen}
              onRequestClose={closeModal}
              contentLabel="Web Results Modal">
              <div className="flex justify-between items-center pb-5 rounded-lg bg-slate-100">
                <h2 className="mt-5 ml-4 text-lg text-zinc-700 font-helvetica-neue font-normal">
                  Sources
                </h2>
                <button
                  className="mt-5 mr-5 px-2 rounded-md text-neutral-50 text-base bg-red-500"
                  onClick={closeModal}>
                  Close
                </button>
              </div>
              <div className="px-2 pt-3">
                {modalIsOpen &&
                  langInterfaceWebSearch.map((result, index) => (
                    <div className="mb-5 mt-2" key={index}>
                      <div className="flex flex-col">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-base lg:text-lg text-blue-800 truncate break-words">
                          {result.name}
                        </a>
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mb-3 text-gray-800 text-xs lg:text-sm truncate font-helvetica-neue">
                          {result.url
                            .replace(/^https?:\/\/(www\.)?/, "")
                            .replace(/\/.*/, "")}
                        </a>
                        <p className="text-xs md:text-sm break-words">
                          {result.snippet}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </Modal>
            {showResponse && loading === false && (
              <button
                className="text-sm absolute top-96 mt-9 bg-neutral-200 dark:bg-neutral-500 text-slate-600 dark:text-neutral-300 tracking-wide rounded-br-2xl rounded-bl-lg pl-3 pr-3 pt-1 pb-1 outline-none hover:bg-sky-100 dark:hover:bg-neutral-600 active:scale-90 whitespace-nowrap"
                style={{ width: "500px" }}
                onClick={handleClearAll}>
                Clear Search
              </button>
            )}
          </div>
          {webViewLoading && (
            <div className="top-25 w-full h-full flex items-center justify-center bg-opacity-50 bg-black">
              <FaSpinner className="text-4xl text-neutral-600 animate-spin" />
            </div>
          )}

          <div className="w-full h-full pt-14">
            <webview
              ref={webviewRef}
              src="https://chat.openai.com"
              className="w-full h-full"
              allowpopups="true"
            />
          </div>
        </div>
      )}
    </div>
  );
};
