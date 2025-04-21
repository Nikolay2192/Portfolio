import { DataSource } from "typeorm";
import dotenv from 'dotenv';
import { Book } from "../entity/Book.js";
import { Library } from "../entity/Library.js";
import { Author } from "../entity/Author.js";
import { User } from "../entity/User.js";

dotenv.config({
    path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
});

if (!process.env.JWT_SECRET) throw new Error("Missing JWT_SECRET");
if (!process.env.DB_HOST) throw new Error("Missing DB_HOST");
if (!process.env.DB_PORT) throw new Error("Missing DB_PORT");
if (!process.env.DB_USERNAME) throw new Error("Missing DB_USERNAME");
if (!process.env.DB_PASSWORD) throw new Error("Missing DB_PASSWORD");
if (!process.env.DB_DATABASE) throw new Error("Missing DB_DATABASE");

export const JWT_SECRET = process.env.JWT_SECRET as string;

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [Book, Library, Author, User],
    migrations: [process.env.NODE_ENV === 'production' ? 'dist/migrations/**/*.js' : "src/migrations/**/*.ts"],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development' ? ['schema'] : false,
});


