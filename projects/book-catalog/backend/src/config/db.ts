import { AppDataSource } from "./data-source.js";

export const connectDB = async (): Promise<void> => {
    try {
        await AppDataSource.initialize();
        console.log('Database connected successfully');
    } catch (error) {
        console.log(error, 'Database connection failed!');
    }
}