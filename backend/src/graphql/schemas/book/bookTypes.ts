import { gql } from "apollo-server-koa";

export const bookTypes = gql`

    type Book {
        id: ID!
        slug: String!
        title: String!
        type: BookType!
        author: Author!
    }

    input AuthorInput {
        name: String!
    }
        
    input AddBookInput {
        title: String!
        type: BookType!
        author: AuthorInput!
    }

    input EditBookInput {
        id: ID!
        title: String
        type: BookType
    }

    type Query {
    books: [Book!]!
    booksByType(type: BookType!): [Book!]!
    book(slug: String!): Book!
    }
    
    type Mutation {
    createBook(input: AddBookInput!): Book!
    editBook(input: EditBookInput!): Book!
    deleteBook(id: ID!): Book!
    }
`