import { Library as LibraryType } from '../../../graphql-types/graphql.js';
import { Library } from '../../../entity/Library.js';
import { mapDatabaseBookTypeToGraphQL } from '../utils/mapBookTypeEnum.js';
import { mapBookToGraphQL } from '../bookMapper/bookMapper.js';


export const mapLibraryToGraphQL = (library: Library): LibraryType => ({
  id: library.id,
  type: mapDatabaseBookTypeToGraphQL(library.type),
  books: library.books.map(mapBookToGraphQL),
  __typename: 'Library',
});