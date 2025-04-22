import { gql } from "apollo-server-koa";
import { EmailAddressTypeDefinition } from "graphql-scalars";

export const userTypes = gql`
    ${EmailAddressTypeDefinition}

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