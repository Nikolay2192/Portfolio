import { gql } from "apollo-server-koa";

export const userTypes = gql`
    scalar EmailAddress

    input AddNewUser {
        username: String!
        email: EmailAddress!
        password: String!
    }

    input Login {
        email: EmailAddress!
        password: String!
    }

    type User {
        id: ID!
        username: String!
        email: EmailAddress!
        token: String!
    }

    type Query {
        getUserById(id: ID!): User!
        getAllUsers: [User!]!
    }
    
    type Mutation {
        registerUser(input: AddNewUser!): User!
        loginUser(input: Login!): User!
    }
`