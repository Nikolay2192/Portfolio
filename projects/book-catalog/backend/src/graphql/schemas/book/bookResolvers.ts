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
        books: async (_: unknown, __: unknown): Promise<BookType[] | null> => {
            // TODO: Enable Redis caching once Redis is set up on Windows
            // const cachedBooks = await redis.get('books');

            // if (cachedBooks) {
            //     console.log('Serving from redis cache');
            //     return JSON.parse(cachedBooks);
            // }

            const bookRepository = AppDataSource.getRepository(Book);
            const books = await bookRepository.find();

            if (!books || books.length === 0) {
                throw new ApolloError("No books found", "NO_BOOKS_AVAILABLE");
            }

            // await redis.set('books', JSON.stringify(books), {
            //     EX: 1800
            // });

            return books.map(mapBookToGraphQL);
        },
        booksByType: async (_: unknown, { type }: QueryBooksByTypeArgs): Promise<BookType[] | null> => {
            const bookRepository = AppDataSource.getRepository(Book);
            const books = await bookRepository.findBy({ type });

            if (!books || books.length === 0) {
                throw new ApolloError('There are no books with this type', "NO_BOOKS_WITH_THIS_TYPE");
            }

            return books.map(mapBookToGraphQL);

        } ,
        book: async (_: unknown, { slug }: QueryBookArgs): Promise<BookType | null> => {
            const bookRepository = AppDataSource.getRepository(Book);
            const book = await bookRepository.findOneBy({ slug });

            if (!book) {
                throw new ApolloError("Book does not exist", "BOOK_NOT_FOUND");
            }

            return mapBookToGraphQL(book);
        }
    },
    Mutation: {
        createBook: async (_: unknown, { input }: MutationCreateBookArgs) => {
            const bookRepository = AppDataSource.getRepository(Book);
            const libraryRepositry = AppDataSource.getRepository(Library);
            const authorRepository = AppDataSource.getRepository(Author);
            const { title, author, type } = input;
            const authorName = author.name;

            try {
                let author = await authorRepository.findOneBy({ name: authorName });

                const authorNameSlug = slugify(authorName, { strict: true, remove: /[0-9]/g },);
    
                if (!author) {
                    author = authorRepository.create({ name: authorName, slug: authorNameSlug });
                    await authorRepository.save(author);
                }
    
                let library = await libraryRepositry.findOneBy({ type });
                
                if (!library) {
                    library = libraryRepositry.create({
                        type,
                    });
                    await libraryRepositry.save(library);
                }
                
                let existingBook = await bookRepository.findOne({
                    where: {
                        title,
                        author: { id: author.id },
                        library: { id: library.id }
                    },
                    relations: ["author", "library"]
                });

                const titleSlug = slugify(title, { lower: true, strict: true });
                
                if (!existingBook) {
                    existingBook = bookRepository.create({
                        title,
                        slug: titleSlug,
                        type,
                        author,
                        library
                    });
                    await bookRepository.save(existingBook);
                }

                // await redis.del('books');
                
                return mapBookToGraphQL(existingBook);

              } catch (error) {
                console.error("Error creating book:", error);
                throw new ApolloError("Failed to create book", "CREATE_BOOK_ERROR");
              }
        },
        editBook: async (_: any, { input }: MutationEditBookArgs ) => {
            const bookRepository = AppDataSource.getRepository(Book);
            const libraryRepositry = AppDataSource.getRepository(Library);

            try {
                const existingBook = await bookRepository.findOne({
                    where: { id: input.id },
                    relations: ["library", "author"],
                });
    
                if (!existingBook) {
                    throw new ApolloError("Book does not exist", "BOOK_NOT_FOUND");
                }
    
                if (input.title) {
                    existingBook.title = input.title;
                }
    
                if (input.type && existingBook.library.type !== input.type) {
                    let library = await libraryRepositry.findOneBy({ type: input.type });
                    
                    if (!library) {
                        library = libraryRepositry.create({
                            type: input.type
                        })
                        await libraryRepositry.save(library);
                    }
                    existingBook.type = input.type;
                    existingBook.library = library;
                }
    
                await bookRepository.save(existingBook);
    
                return mapBookToGraphQL(existingBook);
            } catch (error) {
                console.log("EditBook error!", error);
            }
        },
        deleteBook: async (_: any, { id }: MutationDeleteBookArgs): Promise<void | null> => {
            const bookRepository = AppDataSource.getRepository(Book);
            const libraryRepository = AppDataSource.getRepository(Library);

            try {
                const bookToRemove = await bookRepository.findOne({
                    where: { id },
                    relations: ['library']
                });
    
                if (!bookToRemove) {
                    throw new ApolloError('Book does not exist', "BOOK_NOT_FOUND");
                }
                
                const library = bookToRemove.library;
                
                await bookRepository.remove(bookToRemove);
    
                if (library) {
                    const libraryWithBooks = await libraryRepository.findOne({
                        where: { id: library.id },
                        relations: ['books'],
                    });
        
                    if (libraryWithBooks && libraryWithBooks.books.length === 0) {
                        await libraryRepository.remove(libraryWithBooks);
                    }
                }

              } catch (error) {
                console.error("Error deleting book:", error);
                throw new ApolloError("Failed to delete book", "DELETE_BOOK_ERROR");
              }
        }
    }
}

