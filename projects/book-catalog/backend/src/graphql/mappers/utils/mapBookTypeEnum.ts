import { BookType as DatabaseBookType } from '../../../enums/bookTypeEnum.js';
import { BookType as GraphQLBookTypeEnum } from '../../../graphql-types/graphql.js';

export const mapDatabaseBookTypeToGraphQL = (bookType: DatabaseBookType): GraphQLBookTypeEnum => {
  switch (bookType) {
    case DatabaseBookType.Biography:
      return GraphQLBookTypeEnum.Biography;
    case DatabaseBookType.Fantasy:
      return GraphQLBookTypeEnum.Fantasy;
    case DatabaseBookType.History:
      return GraphQLBookTypeEnum.History;
    case DatabaseBookType.Romance:
      return GraphQLBookTypeEnum.Romance;
    case DatabaseBookType.Science:
      return GraphQLBookTypeEnum.Science;
    default:
      console.warn(`Unknown database book type: ${bookType}`);
      return GraphQLBookTypeEnum.Science;
  }
};