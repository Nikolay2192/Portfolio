import { z } from "zod";

const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).+$/;

export const registerUserSchema = z.object({
    username: z.string().min(8, 'Username must be at least 8 characters').trim().max(32),
    email: z.string().email('Invalid email!').transform((val) => val.trim().toLowerCase()),
    password: z.string().min(8, 'Password must be at least 8 characters.').regex(passwordRegex, "Password must contain at least one uppercase letter and one special character").trim().max(32)
});