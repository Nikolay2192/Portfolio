import { Author } from "../../../entity/Author.js";
import { Author as AuthorType } from "../../../graphql-types/graphql.js";

export const mapAuthorToGraphQL = (author: Author): AuthorType => ({
    id: author.id,
    slug: author.slug,
    name: author.name,
})