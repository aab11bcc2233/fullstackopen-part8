import { useLazyQuery, useQuery, useSubscription } from "@apollo/client";
import { useEffect, useState } from "react";
import { ALL_BOOKS, BOOK_ADDED } from "../queries";

const Books = (props) => {
  const result = useQuery(ALL_BOOKS);
  const [getBooksByGenre, booksByGenreResult] = useLazyQuery(ALL_BOOKS, {
    fetchPolicy: "no-cache",
  });

  const [books, setBooks] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [genres, setGenres] = useState([]);

  // useSubscription(BOOK_ADDED, {
  //   onSubscriptionData: ({ subscriptionData }) => {
  //     console.log("App, bookAdded onSubscriptionData: ", subscriptionData);
  //     if (subscriptionData.data) {
  //       if (selectedGenre) {
  //         booksByGenreResult.refetch();
  //       } else {
  //         result.refetch();
  //       }
  //     }
  //   },
  // });

  useEffect(() => {
    // console.log("books, result.data:", result.data);
    if (result.data && result.data.allBooks) {
      const allBooks = result.data.allBooks;
      if (allBooks.length > 0) {
        const tempGenres = new Set(allBooks.flatMap((v) => v.genres));
        // console.log("books, genres:", tempGenres);
        setGenres([...tempGenres, "allGenres"]);
      }
      setBooks(allBooks);
    }
  }, [result.data]);

  useEffect(() => {
    console.log("booksByGenreResult: ", booksByGenreResult);
    if (booksByGenreResult.data && booksByGenreResult.data.allBooks) {
      const allBooks = booksByGenreResult.data.allBooks;
      if (allBooks.length > 0) {
        setSelectedGenre(booksByGenreResult.variables.genre);
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

  const onSelectedGenre = (btn) => {
    const genre = btn.target.value;
    console.log("onSelectedGenre:", genre);
    if (genre === "allGenres") {
      setSelectedGenre("");
      setBooks(result.data.allBooks);
      return;
    }

    getBooksByGenre({
      variables: {
        genre: genre,
      },
    });

    // const searchResult = result.data.allBooks.filter((book) =>
    //   book.genres.includes(genre)
    // );

    // console.log("search by genre:", searchResult);
    // if (searchResult.length > 0) {
    //   setSelectedGenre(genre);
    //   setBooks(searchResult);
    // } else {
    //   setSelectedGenre("");
    //   setBooks(result.data.allBooks);
    // }
  };

  // console.log("books:", result.data);

  return (
    <div>
      <h2>books</h2>

      {selectedGenre ? (
        <div>
          in genre <strong>{selectedGenre}</strong>
        </div>
      ) : null}

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

      <div>
        {genres.map((v) => (
          <button key={v} value={v} onClick={onSelectedGenre}>
            {v}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Books;
