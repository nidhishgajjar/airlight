import React, {
  useContext,
  useState,
  useRef,
  useEffect,
  createContext,
} from "react";
import FetchContext from "./fetch";
import LangInterfaceContext from "./langfacecontext";
import { v4 as uuid } from "uuid";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [allResponses, setAllResponses] = useState([]);
  const [allSearchPrompts, setAllSearchPrompts] = useState([]);
  const [allRelatedQuestions, setAllRelatedQuestions] = useState([]);
  const [userInput, setUserInput] = useState("");
  const inputRef = useRef(null);
  const conversationRef = useRef(null);
  const [previousConversations, setPreviousConversations] = useState({});
  const { setQuickSearchVisible } = useContext(LangInterfaceContext);
  const {
    response,
    relatedQuestions,
    setRelatedQuestions,
    setQuestionsLoading,
    setStreamCompleted,
    allSearchResults,
    setResultLoading,
    setAllSearchResults,
    setResponse,
    setLoading,
    setShowHistory,
    fetchResponse,
    fetchSearchResults,
    fetchBingResults,
    setWebSearchResults,
  } = useContext(FetchContext);

  useEffect(() => {
    setPreviousConversations(
      Object.fromEntries(
        allSearchPrompts.reduce((acc, prompt, i) => {
          const key = uuid();
          const responses = allResponses[(i + 1) % allResponses.length];
          const results =
            allSearchResults[i] === undefined ? [] : allSearchResults[i];
          const question =
            allRelatedQuestions[(i + 1) % allRelatedQuestions.length];
          acc.push([
            key,
            {
              prompt,
              previousResponse: responses,
              previousResults: results,
              previousQuestions: question,
            },
          ]);
          return acc;
        }, [])
      )
    );
  }, [
    allSearchPrompts,
    allResponses,
    allSearchResults,
    allRelatedQuestions,
    relatedQuestions,
  ]);

  const handleInput = (event) => {
    setUserInput(event.target.value);
  };

  const handleClick = async () => {
    try {
      setLoading(true);
      setShowHistory(false);
      setResultLoading(true);
      setQuestionsLoading(true);

      setStreamCompleted(true);
      setAllSearchPrompts([...allSearchPrompts, userInput]);
      setAllResponses([...allResponses, response]);
      setAllRelatedQuestions([...allRelatedQuestions, relatedQuestions]);
      setUserInput("");
      setResponse("");
      setRelatedQuestions([]);

      await Promise.all([
        fetchBingResults(userInput),
        fetchResponse(userInput),
      ]);
      await fetchSearchResults(userInput);
    } catch (error) {
      console.error(error);
      setResponse("Error generating a response");
      setLoading(false);
      setStreamCompleted(false);
    }
  };

  const handleQuestionClick = async (results) => {
    try {
      setLoading(true);
      setResultLoading(true);
      setQuestionsLoading(true);
      setStreamCompleted(true);

      setAllSearchPrompts([...allSearchPrompts, results]);
      setAllResponses([...allResponses, response]);
      setAllRelatedQuestions([...allRelatedQuestions, relatedQuestions]);
      setResponse("");

      await Promise.all([fetchBingResults(results), fetchResponse(results)]);
      await fetchSearchResults(results);
    } catch (error) {
      console.error(error);
      setResponse("Error generating a response");
      setLoading(false);
      setStreamCompleted(false);
    }
  };

  const handleClearClick = () => {
    setUserInput("");
    setResponse("");
    setAllResponses([]);
    setAllSearchPrompts([]);
    setAllSearchResults([]);
    setPreviousConversations({});
    setLoading(false);
    setShowHistory(false);
    setStreamCompleted(false);
    setWebSearchResults([]);
    setAllRelatedQuestions([]);
    setRelatedQuestions([]);
    setQuickSearchVisible(false);
  };

  return (
    <SearchContext.Provider
      value={{
        allResponses,
        allSearchPrompts,
        previousConversations,
        userInput,
        handleQuestionClick,
        setUserInput,
        handleInput,
        handleClick,
        handleClearClick,
        inputRef,
        setPreviousConversations,
        conversationRef,
      }}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchContext;
