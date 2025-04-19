import { gql } from "@apollo/client";

export const ADD_BOOK = gql`
  mutation AddBook($title: String!, $type: BookType!, $author: String!) {
    createBook(title: $title, type: $type, author: $author) {
      id
      title
      type
      author {
      name
      }
    }
  }
`;