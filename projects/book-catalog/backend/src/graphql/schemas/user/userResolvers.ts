import { ApolloError } from "apollo-server-koa";
import { AppDataSource } from "../../../config/data-source.js";
import { EmailAddressResolver } from "graphql-scalars";
import { User } from "../../../entity/User.js";
import { registerUserSchema } from "../../../validation/auth/registerUserSchema.js";
import { mapUserToGraphQL } from "../../mappers/userMapper/userMapper.js";
import { JWT_SECRET } from "../../../config/data-source.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

type getUserByIdProps = {
    id: string;
}

type registerUserProps = {
    input: {
        username: string;
        email: string;
        password: string;
    }
}

type loginUserProps = {
    input: {
        email: string;
        password: string;
    }
}


export const userResolvers = {
    EmailAddress: EmailAddressResolver,

    Query: {
        getUserById: async (_: any, { id }: getUserByIdProps) => {
            const userRepository = AppDataSource.getRepository(User);
            const foundUser = await userRepository.findOneBy({ id });

            if (!foundUser) {
                throw new ApolloError("User does not exist", "USER_NOT_FOUND");
            }

            return mapUserToGraphQL(foundUser);
        },
        getAllUsers: async (_: any) => {

            const userRepository = AppDataSource.getRepository(User);
            const allUsers = await userRepository.find();

            if (!allUsers) {
                throw new ApolloError('No registered users', "NO_USERS_FOUND");
            }

            return allUsers.map(mapUserToGraphQL);
        }
    },
    Mutation: {
        registerUser: async (_: any, { input }: registerUserProps) => {
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
                throw new ApolloError('User or email already exists!');
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
        loginUser: async (_: any, { input }: loginUserProps) => {
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