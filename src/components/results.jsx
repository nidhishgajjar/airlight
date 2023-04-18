import React, { useContext, useState } from "react";
import SearchContext from "../contexts/search";
import FetchContext from "../contexts/fetch";
import LangInterfaceContext from "../contexts/langfacecontext";
import { ViewSourcesModal } from "./sourcesmodal";
import { FaPlus } from "react-icons/fa";




export const Results = () => {
  const ipcRenderer = window.electron ? window.electron.ipcRenderer : null;
  const {
    response,
    streamCompleted,
    loading,
    showHistory,
    relatedQuestions,
    questionsLoading,
  } = useContext(FetchContext);
  const {
    previousConversations,
    handleQuestionClick,
  } = useContext(SearchContext);
  const { langInterfaceVisible } = useContext(LangInterfaceContext);

  const [firstModalIsOpen, setFirstModalIsOpen] = useState(false);


  const formattedResponse = response
    .split("\n")
    .map((step, index) => <ul key={index}>{step}</ul>);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentKey, setCurrentKey] = useState("");

  function openModal(keyUUID) {
    setModalIsOpen(true);
    setCurrentKey(keyUUID);
  }

  function openFirstModal() {
    setFirstModalIsOpen(true);
  }


  function openInDefaultBrowser(url) {
    ipcRenderer.send("open-url", url);
  }

  function closeModal() {
    setModalIsOpen(false);
  }

  function closeFirstModal() {
    setFirstModalIsOpen(false);
  }

  
  // Reverse the previousConversations object
  const reversedConversations = Object.entries(previousConversations).reverse();

  return (
    <div className="font-helvetica-neue flex lg:justify-start">
      {langInterfaceVisible === false && (
        <div
          className="fixed pl-5 md:pl-16 pr-5 md:pr-16 bottom-5 pb-7 overflow-y-scroll w-full whitespace-normal"
          style={{ top: "250px" }}>
          {reversedConversations.length > 0 && (
            <div>
              <div className="mb-3 flex justify-between items-center">
                <h1 className="mt-5 pr-7 font-semibold text-zinc-700 dark:text-neutral-300 text-xl md:text-2xl break-words">
                  {reversedConversations[0][1].prompt}
                </h1>
                {loading === false && (
                  <button
                    className="mt-5 text-sm bg-slate-100 dark:bg-neutral-700 text-slate-600 dark:text-neutral-400 rounded-full pl-3 pr-3 pt-1 pb-1 outline-none hover:bg-sky-100 dark:hover:bg-neutral-600 active:scale-90 whitespace-nowrap"
                    onClick={openFirstModal}>
                    View Sources
                  </button>
                )}
              </div>
              {
                <div>
                  <ViewSourcesModal
                    isOpen={firstModalIsOpen}
                    onRequestClose={closeFirstModal}
                    previousResults={
                      reversedConversations[0]?.[1]?.previousResults || []
                    }
                    openInDefaultBrowser={openInDefaultBrowser}
                  />
                </div>
              }

              <div>
                <ul className="tracking-wide mt-3 md:tracking-wider text-gray-800 dark:text-neutral-300 text-base md:text-lg max-w-6xl">
                  {formattedResponse}
                </ul>
              </div>

              <div className="w-full">
                {streamCompleted && (
                  <div className="pt-6 w-full">
                    <div className="outline-none bg-slate-300 dark:bg-neutral-100  rounded-md p-5 animate-pulse"></div>
                    <div className="outline-none bg-slate-300 dark:bg-neutral-100  rounded-md p-5 mt-4 animate-pulse"></div>
                  </div>
                )}
              </div>

              {questionsLoading && loading === false && (
                <div className="pt-6 w-full">
                  <div className="outline-none bg-slate-300 dark:bg-neutral-100 rounded-md p-5 animate-pulse"></div>
                  <div className="outline-none bg-slate-300 dark:bg-neutral-100 rounded-md p-5 mt-4 animate-pulse"></div>
                  <div className="outline-none bg-slate-300 dark:bg-neutral-100 rounded-md p-5 mt-4 animate-pulse"></div>
                </div>
              )}

              {questionsLoading === false && (
                <div className="flex flex-col pb-3 space-y-4 pt-8">
                  {relatedQuestions.map((results, index) => (
                    <button
                      key={index}
                      className="bg-transparent text-left border hover:bg-sky-50 dark:hover:bg-neutral-800 active:scale-95 border-gray-200 dark:border-opacity-20 text-slate-500 dark:text-neutral-400 rounded-xl px-3 py-1 text-sm whitespace items-center flex"
                      onClick={() =>
                        handleQuestionClick(results.replace(/"/g, ""))
                      }>
                      <FaPlus className="mr-2 h-3 text-slate-300 dark:text-neutral-400" />{" "}
                      {results.replace(/"/g, "")}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {loading === false &&
            showHistory &&
            reversedConversations.length > 1 && (
                <div className="bg-neutral-50 dark:bg-neutral-800 p-5 rounded-lg mt-8">
                  <h1 className="text-2xl dark:text-neutral-400 text-neutral-600">Search History</h1>
                  <div>
                    {reversedConversations
                      .slice(1)
                      .map(
                        ([
                          keyUUID,
                          {
                            prompt,
                            previousResponse,
                            previousResults,
                            previousQuestions,
                          },
                        ]) => (
                          <div key={keyUUID}>
                            <hr className=" w-full mt-5 border-neutral-100 dark:border-neutral-700 border-2" />
                            <div className="mb-3 flex justify-between items-center">
                              <h1 className="mt-5 pr-7 font-semibold text-zinc-700 dark:text-neutral-300 text-xl md:text-2xl break-words">
                                {prompt}
                              </h1>

                              {loading === false && (
                                <button
                                  className="mt-5 text-sm bg-slate-100 dark:bg-neutral-700 text-slate-600 dark:text-neutral-400 rounded-full pl-3 pr-3 pt-1 pb-1 outline-none hover:bg-sky-100 dark:hover:bg-neutral-600 active:scale-90 whitespace-nowrap"
                                  onClick={() => openModal(keyUUID)}>
                                  View Sources
                                </button>
                              )}
                            </div>
                            {
                              <div>
                                <ViewSourcesModal
                                  isOpen={modalIsOpen}
                                  onRequestClose={closeModal}
                                  previousResults={
                                    previousConversations[currentKey]
                                      ?.previousResults || []
                                  }
                                  openInDefaultBrowser={openInDefaultBrowser}
                                />
                              </div>
                            }
                            <ul className="tracking-wide md:tracking-wider mb-5 text-gray-800 dark:text-neutral-300 text-base md:text-lg max-w-6xl">
                              {previousResponse
                                .split("\n")
                                .map((step, index) => (
                                  <li key={index}>{step}</li>
                                ))}
                            </ul>

                            <div className="flex flex-col pb-3 space-y-4 pt-3">
                              {previousQuestions.map((results, index) => (
                                <button
                                  key={index}
                                  className="bg-transparent text-left border hover:bg-sky-50 dark:hover:bg-neutral-800 active:scale-95 border-gray-200 dark:border-opacity-20 text-slate-500 dark:text-neutral-400 rounded-xl px-3 py-1 text-sm whitespace items-center flex"
                                  onClick={() =>
                                    handleQuestionClick(
                                      results.replace(/"/g, "")
                                    )
                                  }>
                                  <FaPlus className="mr-2 h-3 text-slate-300" />{" "}
                                  {results.replace(/"/g, "")}
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                  </div>
                </div>
              )}
        </div>
      )}
    </div>
  );
};
