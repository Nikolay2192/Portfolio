import { JWT_SECRET } from "../config/data-source.js";
import jwt from 'jsonwebtoken';

const authMiddleware = async (ctx: any, next: Function) => {
    const token = ctx.headers['authorization']?.split(' ')[1];

    if (!token) {
        ctx.state.user = null;
        return next();
    }

    try {
        ctx.state.user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        ctx.state.user = null;
        throw new Error('UNAUTHORIZED_ACCESS');
    }

    return next();
}

export default authMiddleware;