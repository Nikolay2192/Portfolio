import { gql } from "apollo-server-koa";

export const libraryTypes = gql`
    type Library {
        id: ID!
        type: BookType!
        books: [Book!]!
    }
    
    type Query {
        library(id: ID!): Library!
        libraries: [Library!]!
    }
`