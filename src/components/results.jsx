import React, { useContext, useState } from "react";
import SearchContext from "../contexts/search";
import FetchContext from "../contexts/fetch";
import LangInterfaceContext from "../contexts/langfacecontext";
import Modal from "react-modal";
import { FaPlus } from "react-icons/fa";

Modal.setAppElement("#root");

export const Results = () => {
  const {
    response,
    streamCompleted,
    loading,
    relatedQuestions,
    questionsLoading,
  } = useContext(FetchContext);
  const { previousConversations, conversationRef, handleQuestionClick } =
    useContext(SearchContext);
  const { langInterfaceVisible } = useContext(LangInterfaceContext);

  const formattedResponse = response
    .split("\n")
    .map((step, index) => <ul key={index}>{step}</ul>);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentKey, setCurrentKey] = useState("");

  function openModal(keyUUID) {
    setModalIsOpen(true);
    setCurrentKey(keyUUID);
  }

  function closeModal() {
    setModalIsOpen(false);
  }

  return (
    <div className="font-helvetica-neue flex lg:justify-start">
      {langInterfaceVisible === false && (
        <div
          ref={conversationRef}
          className="fixed pl-5 md:pl-16 pr-5 md:pr-16 bottom-5 pb-7 overflow-y-scroll w-full whitespace-normal"
          style={{ top: "250px" }}>
          <div>
            {Object.entries(previousConversations).map(
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
                  <hr className=" w-full mt-3 border-neutral-100 dark:border-neutral-800 border-2" />
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
                        <div className="px-2 pt-3 max-w-5xl">
                          {modalIsOpen &&
                            previousConversations[
                              currentKey
                            ].previousResults.map((result, index) => (
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
                    </div>
                  }
                  <ul className="tracking-wide md:tracking-wider mb-5 text-gray-800 dark:text-neutral-300 text-base md:text-lg max-w-6xl">
                    {previousResponse.split("\n").map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>

                  <div className="flex flex-col pb-3 space-y-4 pt-3">
                    {previousQuestions.map((results, index) => (
                      <button
                        key={index}
                        className="bg-transparent text-left border hover:bg-sky-50 dark:hover:bg-neutral-800 active:scale-95 border-gray-200 dark:border-opacity-20 text-slate-500 dark:text-neutral-400 rounded-xl px-3 py-1 text-sm whitespace items-center flex"
                        onClick={() =>
                          handleQuestionClick(results.replace(/"/g, ""))
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

          <div>
            <ul className="tracking-wide -mt-7 md:tracking-wider text-gray-800 dark:text-neutral-300 text-base md:text-lg max-w-6xl">
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
    </div>
  );
};
