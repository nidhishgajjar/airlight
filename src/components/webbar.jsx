import React, { useContext } from "react";
import FetchContext from "../contexts/fetch";

export const WebBar = () => {
  const { webSearchResults, resultLoading } = useContext(FetchContext);
  const ipcRenderer = window.electron ? window.electron.ipcRenderer : null;

  function openInDefaultBrowser(url) {
    ipcRenderer.send("open-url", url);
  }


  if (resultLoading) {
    return (
      <div className="mt-7 md:mt-12 w-full">
        <div className="outline-none bg-slate-300 dark:bg-neutral-100 rounded-md p-4 animate-pulse"></div>
        <div className="outline-none bg-slate-300 dark:bg-neutral-100 rounded-md p-4 mt-4 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="mt-5 md:mt-10 w-full pr-10 flex items-center overflow-x-auto pt-2">
      <div className="flex space-x-4 pb-2">
        {webSearchResults.map((result, index) => (
          <a
            key={index}
            href={result.url}
            onClick={(e) => {
              e.preventDefault();
              openInDefaultBrowser(result.url);
            }}
            target="_blank"
            rel="noreferrer"
            className="flex-none">
            <div className="bg-neutral-100 dark:bg-neutral-700 rounded-md flex flex-col justify-start py-3 px-3 max-w-xs">
              <p className="text-sm md:text-base truncate text-zinc-800 dark:text-neutral-200 font-helvetica-neue">
                {result.name}
              </p>
              <p className="truncate my-1 text-blue-900 dark:text-blue-300 text-xs md:text-sm w-44 md:w-52">
                {result.url
                  .replace(/^https?:\/\/(www\.)?/, "")
                  .replace(/\/.*/, "")}
              </p>
              <p className="text-xs md:text-sm h-12 text-zinc-800 dark:text-neutral-200 font-helvetica-neue overflow-hidden">
                {result.snippet}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
