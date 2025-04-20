import { User } from "../../../entity/User";
import { User as UserType } from "../../../graphql-types/graphql";


export const mapUserToGraphQL = (user: User): UserType => ({
    id: user.id,
    username: user.username,
    email: user.email,
    __typename: 'User',
})