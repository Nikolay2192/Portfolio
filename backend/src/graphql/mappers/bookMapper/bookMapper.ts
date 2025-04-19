import { Book as BookType } from "../../../graphql-types/graphql.js";
import { Book } from "../../../entity/Book.js";
import { mapDatabaseBookTypeToGraphQL } from "../utils/mapBookTypeEnum.js";

export const mapBookToGraphQL = (book: Book): BookType => ({
  id: book.id,
  title: book.title,
  slug: book.slug,
  type: mapDatabaseBookTypeToGraphQL(book.type),
  author: {
    id: book.author.id,
    slug: book.author.slug,
    name: book.author.name,
    __typename: 'Author',
  },
  __typename: 'Book',
});