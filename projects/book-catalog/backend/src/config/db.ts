import { AppDataSource } from "./data-source.js";

let databaseConnection: any = null;

export const connectDB = async (): Promise<void> => {
  try {
    databaseConnection = await AppDataSource.initialize();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed!');
    console.error('Error message:', (error as Error).message);
    process.exit(1);
  }
};

export const closeDB = async (): Promise<void> => {
  if (databaseConnection) {
    try {
      await AppDataSource.destroy();
      console.log('Database connection closed gracefully');
    } catch (error) {
      console.error('Error closing database connection');
      console.error('Error message:', (error as Error).message);
    }
  }
};
