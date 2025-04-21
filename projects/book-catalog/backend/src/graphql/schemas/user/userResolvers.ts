import { ApolloError } from "apollo-server-koa";
import { AppDataSource } from "../../../config/data-source.js";
import { EmailAddressResolver } from "graphql-scalars";
import { User } from "../../../entity/User.js";
import { registerUserSchema } from "../../../validation/auth/registerUserSchema.js";
import { mapUserToGraphQL } from "../../mappers/userMapper/userMapper.js";
import { JWT_SECRET } from "../../../config/data-source.js";
import { MutationLoginUserArgs, MutationRegisterUserArgs, QueryGetUserByIdArgs } from "../../../graphql-types/graphql.js";
import { User as UserType } from "../../../graphql-types/graphql.js";

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const userResolvers = {
    EmailAddress: EmailAddressResolver,

    Query: {
        getUserById: async (_: any, { id }: QueryGetUserByIdArgs): Promise<UserType> => {
            const userRepository = AppDataSource.getRepository(User);
            const foundUser = await userRepository.findOneBy({ id });

            if (!foundUser) {
                throw new ApolloError("User does not exist", "USER_NOT_FOUND");
            }

            return mapUserToGraphQL(foundUser);
        },
        getAllUsers: async (_: any): Promise<UserType[]> => {

            const userRepository = AppDataSource.getRepository(User);
            const allUsers = await userRepository.find();

            if (allUsers.length === 0) {
                throw new ApolloError('No registered users', "NO_USERS_FOUND");
            }

            return allUsers.map(mapUserToGraphQL);
        }
    },
    Mutation: {
        registerUser: async (_: any, { input }: MutationRegisterUserArgs): Promise<{user: UserType, token: string}> => {
            const { username, email, password } = input;

            try {
                registerUserSchema.parse(input);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    throw new ApolloError(error.message, "VALIDATION_ERROR");
                }
                throw new ApolloError("An unknown error occurred", "UNKNOWN_ERROR");
            }

            const userRepository = AppDataSource.getRepository(User);
            const userExists = await userRepository.findOne({
                where: [
                    { username },
                    { email }
                ]
            })

            if (userExists !== null) {
                throw new ApolloError('User or email already exists!', "USER_OR_EMAIL_ALREADY_EXISTS!");
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = userRepository.create({
                username,
                email,
                password: hashedPassword
            })
            await userRepository.save(newUser);

            const token = jwt.sign(
                { userId: newUser.id },
                JWT_SECRET,
                { expiresIn: '30m' }
            );

            return {
                user: mapUserToGraphQL(newUser),
                token
            };
        },
        loginUser: async (_: any, { input }: MutationLoginUserArgs): Promise<{user: UserType, token: string}> => {
            const userRepository = AppDataSource.getRepository(User);

            const userAccount = await userRepository.findOne({ where: {email: input.email}, select: ['id', 'email', 'password', 'username'] });

            if (!userAccount) {
                throw new ApolloError('Account with this email does not exist', "NO_SUCH_ACCOUNT");
            }

            const isPasswordValid = await bcrypt.compare(input.password, userAccount.password);

            if (!isPasswordValid) {
                throw new ApolloError('Email or Password is incorrect', "INVALID_PASSWORD");
            }

            const token = jwt.sign(
                { userId: userAccount.id },
                JWT_SECRET,
                { expiresIn: '30m' }
            );

            return {
                user: mapUserToGraphQL(userAccount),
                token
            };
        }
    }
}