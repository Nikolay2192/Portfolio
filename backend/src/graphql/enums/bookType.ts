import { gql } from "apollo-server-koa";
import { BookType } from "../../enums/bookTypeEnum";

export const bookTypeEnum = gql`
  enum BookType {
    FANTASY
    ROMANCE
    BIOGRAPHY
    SCIENCE
    HISTORY
  }
`;