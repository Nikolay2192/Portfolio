import { JWT_SECRET } from "../config/data-source.js";
import type { Context, Next } from "koa";
import jwt from 'jsonwebtoken';

const authMiddleware = async (ctx: Context, next: Next) => {
    const authHeader = ctx.headers['authorization'];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        ctx.state.user = null;
        return await next();
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        ctx.state.user = decoded;
        await next();
    } catch (err) {
        ctx.status = 401;
        ctx.body = {
            success: false,
            error: "Unauthorized",
            message: "Invalid or expired token",
        };
    }
}

export default authMiddleware;