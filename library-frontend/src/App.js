import { useApolloClient, useSubscription } from "@apollo/client";
import { useEffect, useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import Login from "./components/Login";
import NewBook from "./components/NewBook";
import Notification from "./components/Notification";
import RecommendBooks from "./components/RecommendBooks";
import { ALL_BOOKS, BOOK_ADDED } from "./queries";

const App = () => {
  const [notifyMsg, setNotifyMsg] = useState("");
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState("");
  const [isRefetch, setIsRefetch] = useState(false);

  const client = useApolloClient();

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      console.log("App, bookAdded onSubscriptionData: ", subscriptionData);
      if (subscriptionData.data) {
        const book = subscriptionData.data.bookAdded;
        showNotify(`${book.title} added`);
        client.cache.updateQuery({ query: ALL_BOOKS }, ({ allBooks }) => {
          return {
            allBooks: allBooks.concat(book),
          };
        });
      }
    },
  });

  useEffect(() => {
    setToken(localStorage.getItem("user-token"));
  }, []);

  const clickLoginOut = () => {
    if (page === "add") {
      setPage("authors");
    }
    localStorage.setItem("user-token", "");
    setToken("");
  };

  const showNotify = (msg) => {
    setNotifyMsg(msg);
    setTimeout(() => {
      setNotifyMsg("");
    }, 5000);
  };

  const onBookCreated = () => {
    setIsRefetch(true);
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token ? (
          <button onClick={() => setPage("add")}>add book</button>
        ) : null}

        {token ? (
          <button onClick={() => setPage("recommend")}>recommend</button>
        ) : null}

        {token ? (
          <button onClick={clickLoginOut}>logout</button>
        ) : (
          <button onClick={() => setPage("login")}>login</button>
        )}
      </div>

      <Notification message={notifyMsg} />

      <Authors show={page === "authors"} token={token} />

      <Books show={page === "books"} />

      <NewBook
        show={page === "add"}
        setError={(errMsg) => {
          showNotify(errMsg);
        }}
        onCreated={onBookCreated}
      />

      <RecommendBooks show={page === "recommend"} />

      <Login
        show={page === "login"}
        setError={(errMsg) => {
          showNotify(errMsg);
        }}
        setToken={(token) => {
          setPage("authors");
          setToken(token);
        }}
      />
    </div>
  );
};

export default App;
