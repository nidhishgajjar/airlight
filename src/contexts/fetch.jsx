import React, { useState, useContext, createContext } from "react";
import LangInterfaceContext from "./langfacecontext";

const FetchContext = createContext();

export const FetchSearchResultsProvider = ({ children }) => {
  const [response, setResponse] = useState("");
  const [langInterfaceResponse, setLangInterfaceResponse] = useState("");
  const [webSearchResults, setWebSearchResults] = useState([]);
  const [langInterfaceWebSearch, setLangInterfaceWebSearch] = useState([]);
  const [langInterfaceQuestions, setLangInterfaceQuestions] = useState([]);
  const [allSearchResults, setAllSearchResults] = useState([]);
  const [language, setLanguage] = useState("English");
  const [streamCompleted, setStreamCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [resultLoading, setResultLoading] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [relatedQuestions, setRelatedQuestions] = useState([]);

  const { langInterfaceVisible } = useContext(LangInterfaceContext);

  const fetchRelated = async (prompt, finalResponse) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_RELATED_ENDPOINT}q=${prompt}&lang=${language}&finalResponse=${finalResponse}`,
        {
          headers: {
            Authorization: process.env.REACT_APP_RELATED_API_KEY,
          },
        }
      );

      const data = await response.text(); // Read response as text
      const somethingList = data.split(/\d+\.\s/).filter(Boolean);

      if (langInterfaceVisible === false) {
        setRelatedQuestions(somethingList);
      } else {
        setLangInterfaceQuestions(somethingList);
      }
    } catch (err) {
      if (langInterfaceVisible === false) {
        setRelatedQuestions(["Error generating related questions"]);
      } else {
        setLangInterfaceQuestions(["Error generating related questions"]);
      }
    }
    setQuestionsLoading(false);
  };

  const fetchResponse = async (prompt) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_RESPONSE_ENDPOINT}q=${prompt}&lang=${language}`,
        {
          headers: {
            Authorization: process.env.REACT_APP_RESPONSE_API_KEY,
          },
        }
      );

      const stream = response.body.getReader();
      let chunkResponse = "";

      while (true) {
        const { done, value } = await stream.read();
        if (done) {
          setStreamCompleted(false);
          break;
        }
        chunkResponse += new TextDecoder().decode(value);
        if (langInterfaceVisible === false) {
          setResponse(chunkResponse);
        } else {
          setLangInterfaceResponse(chunkResponse);
        }

        setStreamCompleted(false);
        if (langInterfaceVisible === false) {
          setShouldScroll(true);
        }
        setLoading(true);
      }
      fetchRelated(prompt, chunkResponse);
    } catch (err) {
      if (langInterfaceVisible === false) {
        setResponse("Error generating a response");
      } else {
        setLangInterfaceResponse("Error generating a response");
      }
      setLoading(false);
      setStreamCompleted(false);
    }
  };

  const fetchSearchResults = async (prompt) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_RESULTS_ENDPOINT}q=${prompt}&lang=${language}`,
        {
          headers: {
            Authorization: process.env.REACT_APP_RESULTS_API_KEY,
          },
        }
      );

      const stream = response.body.getReader();
      let resultsJSON = "";

      while (true) {
        const { done, value } = await stream.read();
        if (done) {
          break;
        }
        resultsJSON += new TextDecoder().decode(value);
        const searchResults = JSON.parse(resultsJSON);

        if (langInterfaceVisible === false) {
          setAllSearchResults([...allSearchResults, searchResults]);
        } else {
          setLangInterfaceWebSearch(searchResults);
        }
      }
    } catch (err) {
      if (langInterfaceVisible === false) {
        setAllSearchResults([]);
      } else {
        setLangInterfaceWebSearch([]);
      }
      setLoading(false);
      setStreamCompleted(false);
    }
    setLoading(false);
  };

  const fetchBingResults = async (prompt) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SEARCH_ENDPOINT}q=${prompt}&lang=${language}`,
        {
          headers: {
            Authorization: process.env.REACT_APP_SEARCH_API_KEY,
          },
        }
      );

      const stream = response.body.getReader();
      let resultsJSON = "";

      while (true) {
        const { done, value } = await stream.read();
        if (done) {
          break;
        }
        resultsJSON += new TextDecoder().decode(value);
        const searchResults = JSON.parse(resultsJSON);

        setWebSearchResults(searchResults);
      }
    } catch (err) {
      setWebSearchResults([]);
      setResultLoading(false);
      setStreamCompleted(false);
    }
    setResultLoading(false);
  };

  return (
    <FetchContext.Provider
      value={{
        response,
        streamCompleted,
        loading,
        shouldScroll,
        webSearchResults,
        language,
        allSearchResults,
        relatedQuestions,
        resultLoading,
        questionsLoading,
        langInterfaceResponse,
        langInterfaceWebSearch,
        langInterfaceQuestions,
        setLangInterfaceQuestions,
        setLangInterfaceWebSearch,
        setLangInterfaceResponse,
        setQuestionsLoading,
        setResultLoading,
        setLanguage,
        setResponse,
        setLoading,
        setStreamCompleted,
        setShouldScroll,
        setWebSearchResults,
        setAllSearchResults,
        setRelatedQuestions,
        fetchResponse,
        fetchSearchResults,
        fetchBingResults,
        fetchRelated,
      }}>
      {children}
    </FetchContext.Provider>
  );
};

export default FetchContext;
