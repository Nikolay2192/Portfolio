import { Library } from "../../../entity/Library.js";
import { AppDataSource } from "../../../config/data-source.js";
import { QueryLibraryArgs, Library as LibraryType} from '../../../graphql-types/graphql.js';
import { mapLibraryToGraphQL } from "../../mappers/libraryMapper/libraryMapper.js";
import { ApolloError } from "apollo-server-koa";

export const libraryResolvers = {
  Query: {
    library: async (_: unknown, { id }: QueryLibraryArgs): Promise<LibraryType> => {
      const libraryRepository = AppDataSource.getRepository(Library);
      const library = await libraryRepository.findOne({
        where: { id },
        relations: ["books", "books.author"],
      });

      if (!library) {
        throw new ApolloError('Library does not exist', "LIBRARY_DOES_NOT_EXIST!")
      }

      return mapLibraryToGraphQL(library);
    },
    libraries: async (): Promise<LibraryType[]> => {
      const libraryRepository = AppDataSource.getRepository(Library);
      const libraries = await libraryRepository
      .createQueryBuilder('library')
      .leftJoinAndSelect('library.books', 'book')
      .leftJoinAndSelect('book.author', 'author')
      .getMany();

      if (libraries.length === 0) {
        throw new ApolloError('No libraries found', "NO_LIBRARIES_FOUND");
      }

      return libraries.map(mapLibraryToGraphQL);
    }
  }
};