import React, { useContext } from "react";
import SearchContext from "../contexts/search";
import FetchContext from "../contexts/fetch";
import LangInterfaceContext from "../contexts/langfacecontext";
import Logo from "../assets/ChatGPT_logo.svg";

export const Header = () => {
  const { handleClearClick } = useContext(SearchContext);
  const { loading, questionsLoading, language, setLanguage } =
    useContext(FetchContext);
  const { setLangInterfaceVisible } = useContext(LangInterfaceContext);

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  return (
    <div className="flex justify-between pt-5 items-center">
      <div className="flex items-center space-x-3">
        <div className="font-helvetica-neue text-2xl text-gray-700 dark:text-neutral-400">
          Quick Search
        </div>
        <select
          className="bg-zinc-100 dark:bg-neutral-700 rounded-md text-zinc-700 dark:text-neutral-400 px-3 py-1 appearance-none"
          value={language}
          onChange={handleLanguageChange}>
          <option value="Chinese">zh</option>
          <option value="English">en</option>
          <option value="French">fr</option>
          <option value="Japanese">ja</option>
          <option value="Hindi">hi</option>
          <option value="Russian">ru</option>
        </select>
        <button
          className=" w-7"
          onClick={() => {
            setLangInterfaceVisible(true);
            handleClearClick();
          }}>
          <img src={Logo} alt="ChatGPT" />
        </button>  
      </div>
      <button
        className="h-7 md:pl-5 md:pr-5 pl-1 pr-1 text-xs md:text-sm font-light active:scale-95 hover:bg-sky-100 dark:hover:bg-neutral-700 border border-neutral-400 rounded-md flex justify-center items-center text-slate-600 dark:text-neutral-400"
        onClick={loading && questionsLoading ? null : handleClearClick}>
        Close Search
      </button>
    </div>
  );
};
