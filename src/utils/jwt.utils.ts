import jwt from "jsonwebtoken";
import config from "config";
import dotenv from 'dotenv';

dotenv.config();

const privateKey = config.get("privateKey") as string;

export function signJwt(object: Object, options?: jwt.SignOptions | undefined) {
    return jwt.sign(object, privateKey, options);
}

export function decodeJwt(token: string) {
    try {
        const decoded = jwt.verify(token, privateKey);

        return { valid: true, expired: false, decoded };
    } catch (error: any) {
        return {
            valid: false,
            expired: error.message === "jwt expired",
            decoded: null,
        };
    }
}