import { gql } from "apollo-server-koa";

export const authorTypes = gql`
    type Author {
        id: ID!
        name: String!
        slug: String!
    }

    type Query {
        booksByAuthor(authorId: ID!): [Book!]!
        authors: [Author!]!
        author(id: ID!): Author!
    }
`