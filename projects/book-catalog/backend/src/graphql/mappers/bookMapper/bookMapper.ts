import { Book as BookType } from "../../../graphql-types/graphql.js";
import { Book } from "../../../entity/Book.js";
import { mapDatabaseBookTypeToGraphQL } from "../utils/mapBookTypeEnum.js";
import { mapAuthorToGraphQL } from "../authorMapper/authorMapper.js";

export const mapBookToGraphQL = (book: Book): BookType => ({
  id: book.id,
  title: book.title,
  slug: book.slug,
  type: mapDatabaseBookTypeToGraphQL(book.type),
  author: mapAuthorToGraphQL(book.author),
  __typename: 'Book',
});