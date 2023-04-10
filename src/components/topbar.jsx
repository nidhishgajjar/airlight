import React, { useContext } from "react";
import { Navbar } from "./navbar";
import { WebBar } from "./webbar";
import SearchContext from "../contexts/search";
import LangInterfaceContext from "../contexts/langfacecontext";

export const TopBar = () => {
  const { allSearchPrompts } = useContext(SearchContext);
  const { langInterfaceVisible } = useContext(LangInterfaceContext);
  return (
    <div className="pl-5 md:pl-16 pr-5 md:pr-12 top-12 fixed flex flex-col w-full px-3">
      {allSearchPrompts.length >= 1 && langInterfaceVisible === false && (
        <div>
          <Navbar />
          <WebBar />
        </div>
      )}
    </div>
  );
};
