import { gql } from "apollo-server-koa";
import { BookType } from "../../graphql-types/graphql";

export const bookTypeEnum = gql`
  enum BookType {
    FANTASY
    ROMANCE
    BIOGRAPHY
    SCIENCE
    HISTORY
  }
`;