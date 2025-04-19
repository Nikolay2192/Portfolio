import { useState } from "react"
import styled from "styled-components";
import { useLazyQuery } from "@apollo/client";
import { GET_SINGLE_BOOK } from "./graphql/queries/getBook";

enum BookType {
  FANTASY = "FANTASY",
  ROMANCE = "ROMANCE",
  BIOGRAPHY = "BIOGRAPHY",
  SCIENCE = "SCIENCE",
  HISTORY = "HISTORY"
}

type Book = {
  id: string;
  title: string;
  type: BookType;
}

const Container = styled.div`
  box-size: border-box;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const AddBookButton = styled.button`
  padding: 6px 12px;
  font-size: 16px;
  background-color: rgb(202, 168, 168);
  border: 2px solid black;
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 20px;

  &:active {
  background-color: rgb(173, 145, 145);
  }
`

const BooksContainer = styled.ol`
    display: flex;
    flex-direction: column;
    gap: 10px;
`

const BookItem = styled.li`

`

function App() {

  const [books, setBooks] = useState<Book[]>([]);
  const [bookIndex, setBookIndex] = useState<number>(0);
  const [getBook, { data }] = useLazyQuery(GET_SINGLE_BOOK);

  const fetchBook = async () => {
    const nextBookIndex = bookIndex + 1;

    const { data, error } = await getBook({
      variables: { slug: `book-slug-${nextBookIndex}` }
    });

    if (error) {
      console.log(error);
    }

    if (data?.book) {
      setBooks((prevBooks) => [...prevBooks, data.book]);
      setBookIndex(nextBookIndex);
    }
  };

  return (
    <Container>
      <AddBookButton onClick={fetchBook}>Get Book</AddBookButton>
      <BooksContainer>
      {books.map((book) => (
          <BookItem key={book.id}>
            {book.title} - {book.type}
          </BookItem>
        ))}
      </BooksContainer>
    </Container>
  )
}

export default App
