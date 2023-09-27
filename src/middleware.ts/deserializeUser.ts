// to remove bearer access to token
import { get } from 'lodash';
import { Request, Response, NextFunction } from "express";

import { reIssueAccessToken } from '../service/session.service';
import { decodeJwt } from '../utils/jwt.utils';



const deserializeUser = async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = get(req, "headers.authorization", "").replace(
        /^Bearer\s/,
        ""
    );

    const refreshToken = get(req, "headers.x-refresh")

    if (!accessToken) {
        return next();
    }

    const { decoded, expired } = decodeJwt(accessToken);


    if (decoded) {
        res.locals.user = decoded;
        return next();
    }

    if (expired && refreshToken) {
        const newAccessToken = await reIssueAccessToken({ refreshToken: 'refreshToken' });

        if (newAccessToken) {
            res.setHeader("x-access-token", newAccessToken);

            const result = decodeJwt(newAccessToken);
            res.locals.user = result.decoded;
        }

        return next();
    }

    return next();
}

export default deserializeUser;