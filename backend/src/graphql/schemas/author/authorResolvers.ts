import { Author } from "../../../entity/Author.js"
import { Book } from "../../../entity/Book.js";
import { AppDataSource } from "../../../config/data-source.js"
import { ApolloError } from "apollo-server-koa";
import { QueryAuthorArgs, QueryBooksByAuthorArgs, Author as AuthorTypes, Book as BookTypes } from "../../../graphql-types/graphql.js";
import { mapBookToGraphQL } from "../../mappers/bookMapper/bookMapper.js";
import { mapAuthorToGraphQL } from "../../mappers/authorMapper/authorMapper.js";

export const authorResolvers = {
    Query: {
        booksByAuthor: async (_: unknown, { authorId }: QueryBooksByAuthorArgs): Promise<BookTypes[] | null> => {
            const booksRepository = AppDataSource.getRepository(Book);

            const books = await booksRepository.findBy({ author: { id: authorId } });

            if (!books || books.length === 0) {
                throw new ApolloError("Author has no books!", "NO_BOOKS_FOUND");
            }

            return books.map(mapBookToGraphQL);
        },
        authors: async (_: unknown): Promise<AuthorTypes[] | null> => {
            const authorRepository = AppDataSource.getRepository(Author);

            const authors = await authorRepository.find();

            if (!authors || authors.length === 0) {
                throw new ApolloError("There aren't any authors", "AUTHORS_NOT_FOUND")
            }

            return authors.map(mapAuthorToGraphQL);
        },
        author: async (_: unknown, { id }: QueryAuthorArgs): Promise<AuthorTypes | null> => {
            const authorRepository = AppDataSource.getRepository(Author);

            const author = await authorRepository.findOneBy({ id });

            if (!author) {
                throw new ApolloError("Author not found", "AUTHOR_NOT_FOUND");
            }

            return mapAuthorToGraphQL(author);
        }
    }
}