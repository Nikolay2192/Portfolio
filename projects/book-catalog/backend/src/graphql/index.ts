import { bookTypes } from "./schemas/book/bookTypes.js";
import { bookTypeEnum } from "./enums/bookType.js";
import { libraryTypes } from "./schemas/library/libraryTypes.js";
import { libraryResolvers } from "./schemas/library/libraryResolvers.js";
import { bookResolvers } from "./schemas/book/bookResolvers.js";
import { authorTypes } from "./schemas/author/authorTypes.js";
import { authorResolvers } from "./schemas/author/authorResolvers.js";
import { userTypes } from "./schemas/user/userTypes.js";
import { userResolvers } from "./schemas/user/userResolvers.js";
import { EmailAddressResolver } from "graphql-scalars";

export const typeDefs = [
    bookTypeEnum,
    bookTypes,
    libraryTypes,
    authorTypes,
    userTypes,
];

export const resolvers = [
    bookResolvers,
    libraryResolvers,
    authorResolvers,
    userResolvers,
    {
        EmailAddress: EmailAddressResolver
    }
];
