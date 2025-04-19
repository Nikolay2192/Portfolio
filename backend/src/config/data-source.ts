import { DataSource } from "typeorm";
import dotenv from 'dotenv';
import { Book } from "../entity/Book.js";
import { Library } from "../entity/Library.js";
import { Author } from "../entity/Author.js";
import { User } from "../entity/User.js";

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET as string;

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [Book, Library, Author, User],
    migrations: ["src/migrations/**/*.ts"],
    synchronize: true,
    logging: ['schema'],
});


