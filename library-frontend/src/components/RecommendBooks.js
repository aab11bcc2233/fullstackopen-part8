import { useLazyQuery, useQuery, useSubscription } from "@apollo/client";
import { useEffect, useState } from "react";
import { ALL_BOOKS, BOOK_ADDED, FIND_ME } from "../queries";

const RecommendBooks = (props) => {
  const result = useQuery(FIND_ME);
  const [getBooksByGenre, booksByGenreResult] = useLazyQuery(ALL_BOOKS, {
    fetchPolicy: "no-cache",
  });

  const [books, setBooks] = useState([]);

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      console.log(
        "RecommendBooks, bookAdded onSubscriptionData: ",
        subscriptionData
      );
      if (subscriptionData.data) {
        booksByGenreResult.refetch();
      }
    },
  });

  useEffect(() => {
    // console.log("books, result.data:", result.data);
    if (result.data) {
      getBooksByGenre({
        variables: {
          genre: result.data.me.favouriteGenre,
        },
      });
    }
  }, [result.data]);

  useEffect(() => {
    console.log("recommend booksByGenreResult: ", booksByGenreResult);
    if (booksByGenreResult.data && booksByGenreResult.data.allBooks) {
      const allBooks = booksByGenreResult.data.allBooks;
      if (allBooks.length > 0) {
        setBooks(allBooks);
      }
    }
  }, [booksByGenreResult.data]);

  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }

  if (books.length === 0) {
    return <div>no content</div>;
  }

  return (
    <div>
      <h2>recommendations</h2>

      <div>
        books in your favorite genre{" "}
        <strong>{result.data.me.favouriteGenre}</strong>
      </div>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecommendBooks;
