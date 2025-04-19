import { gql } from "@apollo/client";

export const GET_SINGLE_BOOK = gql`
    query GetBook ($slug: String!) {
        book(slug: $slug) {
        id
        title
        type
        }
    }
`;

