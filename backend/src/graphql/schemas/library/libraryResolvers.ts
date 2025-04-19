import { Library } from "../../../entity/Library.js";
import { AppDataSource } from "../../../config/data-source.js";
import { QueryLibraryArgs, Library as LibraryType} from '../../../graphql-types/graphql.js';
import { mapLibraryToGraphQL } from "../../mappers/libraryMapper/libraryMapper.js";

export const libraryResolvers = {
  Query: {
    library: async (_: unknown, { id }: QueryLibraryArgs): Promise<LibraryType | null> => {
      const libraryRepository = AppDataSource.getRepository(Library);
      const library = await libraryRepository.findOne({
        where: { id },
        relations: ["books", "books.author"],
      });
      return library ? mapLibraryToGraphQL(library) : null;
    },
    libraries: async (): Promise<LibraryType[]> => {
      const libraryRepository = AppDataSource.getRepository(Library);
      const libraries = await libraryRepository.find({
        relations: ['books', 'books.author']
      });
      if (!libraries) {
        return [];
      }
      return libraries.map(mapLibraryToGraphQL);
    }
  }
};