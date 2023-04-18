import React from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");


export const ViewSourcesModal = ({
  isOpen,
  onRequestClose,
  previousResults,
  openInDefaultBrowser,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Web Results Modal">
      <div className="flex justify-between items-center pb-5 rounded-lg bg-slate-100">
        <h2 className="mt-5 ml-4 text-lg text-zinc-700 font-helvetica-neue font-normal">
          Sources
        </h2>
        <button
          className="mt-5 mr-5 px-2 rounded-md text-neutral-50 text-base bg-red-500"
          onClick={onRequestClose}>
          Close
        </button>
      </div>
      <div className="px-2 pt-3 max-w-5xl">
        {isOpen &&
          previousResults.map((result, index) => (
            <div className="mb-5 mt-2" key={index}>
              <div className="flex flex-col">
                <a
                  href={result.url}
                  onClick={(e) => {
                    e.preventDefault();
                    openInDefaultBrowser(result.url);
                  }}
                  target="_blank"
                  rel="noreferrer"
                  className="text-base lg:text-lg text-blue-800 truncate break-words">
                  {result.name}
                </a>
                <a
                  href={result.url}
                  onClick={(e) => {
                    e.preventDefault();
                    openInDefaultBrowser(result.url);
                  }}
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
  );
};
