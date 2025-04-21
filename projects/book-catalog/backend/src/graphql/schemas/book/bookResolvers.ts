import { ApolloError } from "apollo-server-koa";
import { AppDataSource } from "../../../config/data-source.js";
import { Book } from "../../../entity/Book.js";
import { Library } from "../../../entity/Library.js";
import { Author } from "../../../entity/Author.js";
// import { RedisProps } from "../../../types/types.js";
import slugify from "slugify";
import { QueryBooksByTypeArgs, Book as BookType, QueryBookArgs, MutationCreateBookArgs, MutationEditBookArgs, MutationDeleteBookArgs } from "../../../graphql-types/graphql.js";
import { mapBookToGraphQL } from "../../mappers/bookMapper/bookMapper.js";


export const bookResolvers = {
    Query: {
        books: async (_: unknown, __: unknown): Promise<BookType[]> => {
            // TODO: Enable Redis caching once Redis is set up on Windows
            // const cachedBooks = await redis.get('books');

            // if (cachedBooks) {
            //     console.log('Serving from redis cache');
            //     return JSON.parse(cachedBooks);
            // }

            const bookRepository = AppDataSource.getRepository(Book);
            const books = await bookRepository.find({
                relations: ['author']
            });

            if (books.length === 0) {
                throw new ApolloError("No books found", "NO_BOOKS_AVAILABLE");
            }

            // await redis.set('books', JSON.stringify(books), {
            //     EX: 1800
            // });

            return books.map(mapBookToGraphQL);
        },
        booksByType: async (_: unknown, { type }: QueryBooksByTypeArgs): Promise<BookType[]> => {
            const bookRepository = AppDataSource.getRepository(Book);
            const books = await bookRepository.find({
                where: {
                    type
                },
                relations: ['author']
            });

            if (books.length === 0) {
                throw new ApolloError('There are no books with this type', "NO_BOOKS_WITH_THIS_TYPE");
            }

            return books.map(mapBookToGraphQL);

        },
        book: async (_: unknown, { slug }: QueryBookArgs): Promise<BookType> => {
            const bookRepository = AppDataSource.getRepository(Book);
            const book = await bookRepository.findOne({ where: { slug }, relations: ['author'] },)

            if (!book) {
                throw new ApolloError("Book does not exist", "BOOK_NOT_FOUND");
            }

            return mapBookToGraphQL(book);
        }
    },
    Mutation: {
        createBook: async (_: unknown, { input }: MutationCreateBookArgs): Promise<BookType> => {
            const { title, author, type } = input;
            const authorName = author.name;
            const authorNameSlug = slugify(authorName, { strict: true, remove: /[0-9]/g },);

            try {
                const resultCreatingBook = await AppDataSource.transaction(async (manager) => {

                    let author = await manager.findOneBy(Author, { name: authorName });

                    if (!author) {
                        author = manager.create(Author, { name: authorName, slug: authorNameSlug });
                        await manager.save(author);
                    }

                    let library = await manager.findOneBy(Library, { type });

                    if (!library) {
                        library = manager.create(Library, { type });
                        await manager.save(Library, library);
                    }

                    let book = await manager.findOne(Book, {
                        where: {
                            title,
                            author: { id: author.id },
                            library: { id: library.id }
                        },
                    });

                    const titleSlug = slugify(title, { lower: true, strict: true });

                    if (!book) {
                        book = manager.create(Book, {
                            title,
                            slug: titleSlug,
                            type,
                            author,
                            library
                        });
                        await manager.save(Book, book);
                    }

                    // await redis.del('books');

                    return mapBookToGraphQL(book);
                })

                return resultCreatingBook;

            } catch (error) {
                if (process.env.NODE_ENV !== 'production' && error instanceof Error) {
                    console.error("Error creating book:", error.message);
                }
                throw new ApolloError("Failed to create book", "CREATE_BOOK_ERROR");
            }
        },
        editBook: async (_: any, { input }: MutationEditBookArgs): Promise<BookType> => {
            try {

                const resultEditingBook = await AppDataSource.transaction(async (manager) => {
                    const existingBook = await manager.findOne(Book, {
                        where: { id: input.id },
                        relations: ["library", "author"],
                    });
    
                    if (!existingBook) {
                        throw new ApolloError("Book does not exist", "BOOK_NOT_FOUND");
                    }
    
                    if (input.title && existingBook.title !== input.title) {
                        existingBook.title = input.title;
                        existingBook.slug = slugify(input.title, { lower: true, strict: true });
                    }
    
                    if (input.type && existingBook.library.type !== input.type) {
                        let library = await manager.findOneBy(Library, { type: input.type });
    
                        if (!library) {
                            library = manager.create(Library, {
                                type: input.type
                            })
                            await manager.save(Library, library);
                        }
                        existingBook.library = library;
                    }
    
                    await manager.save(Book, existingBook);
    
                    return mapBookToGraphQL(existingBook);
                })
                return resultEditingBook;
            } catch (error) {
                if (process.env.NODE_ENV !== 'production' && error instanceof Error) {
                    console.error('Error editing book', error.message);
                }

                throw new ApolloError("Failed to edit book", "EDIT_BOOK_ERROR");
            }
        },
        deleteBook: async (_: any, { id }: MutationDeleteBookArgs): Promise<BookType> => {
            try {
                const deleteBookResult = await AppDataSource.transaction(async (manager) => {
                    const bookToRemove = await manager.findOne(Book, {
                        where: { id },
                        relations: ['library']
                    });

                    if (!bookToRemove) {
                        throw new ApolloError('Book does not exist', "BOOK_NOT_FOUND");
                    }

                    const deletedBook = mapBookToGraphQL(bookToRemove);
                    const library = bookToRemove.library;

                    await manager.remove(bookToRemove);

                    if (library) {
                        const libraryWithBooks = await manager.findOne(Library, {
                            where: { id: library.id },
                            relations: ['books'],
                        });

                        if (libraryWithBooks && libraryWithBooks.books.length === 0) {
                            await manager.remove(libraryWithBooks);
                        }
                    }

                    return deletedBook;
                })

                return deleteBookResult;
            } catch (error) {
                if (process.env.NODE_ENV !== 'production' && error instanceof Error) {
                    console.error(`Error occurred while deleting book: ${error.message}`);
                }

                throw new ApolloError("Failed to delete book", "DELETE_BOOK_ERROR");
            }
        }
    }
}

