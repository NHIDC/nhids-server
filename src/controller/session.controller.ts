import config from "config";
import { get } from "lodash";
import { Request, Response } from "express";
import { validatePassword } from "../service/user.service";
import {
    createSession,
    createAccessToken,
    updateSession,
    findSessions,
} from "../service/session.service";

import UserModel, { UserDocument } from "../models/user.model";
import Session, { SessionDocument } from "../models/session.model";
import { signJwt } from "../utils/jwt.utils";
import bcrypt from 'bcrypt'
import logger from "../utils/logger";



export async function createUserSessionHandler(req: Request, res: Response) {
    // validate the email and password
    const user = await validatePassword(req.body);

    if (!user) {
        return res.status(401).send({
            status: false,
            statusCode: 401,
            message: "Invalid email or password"
        });
    }

    const email = req.body.email;
    const password = req.body.password;

    if (!email && !password) {
        return res.status(400).send({
            status: false,
            statusCode: 400,
            message: "User does not exist"
        })
    }

    // Create a session
    const session = await createSession(user._id, req.get("user-agent") || "");

    // create access token
    const accessToken = createAccessToken({
        user: user as Omit<UserDocument, "password">, // Assuming user is of type UserDocument
        session: session as Omit<SessionDocument, "password">, // Assuming session is of type SessionDocument
    });

    // create refresh token
    const refreshToken = signJwt(session, {
        expiresIn: config.get("refreshTokenTtl"), // 1 year
    });

    // send refresh & access token back
    return res.send({
        status: true,
        stausCode: 200,
        message: "User logged in successfully",
        accessToken,
        refreshToken
    });
}

export async function invalidateUserSessionHandler(
    req: Request,
    res: Response
) {
    const sessionId = get(req, "user.session");

    await updateSession({ _id: sessionId }, { valid: false });

    return res.sendStatus(200);
}

export async function getUserSessionsHandler(req: Request, res: Response) {
    const userId = get(req, "user._id");

    const sessions = await findSessions({ user: userId, valid: true });

    return res.send(sessions);
}

export async function deleteSessionHandler(req: Request, res: Response) {
    const sessionId = res.locals.user.session;

    await updateSession({ _id: sessionId }, { valid: false })

    return res.send({
        accessToken: null,
        refreshToken: null,
    })
}

export async function changePasswordSessionHandler(req: Request, res: Response) {
    try {
        const { email, old_password, new_password } = req.body;

        // Find the user by email
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).send({
                status: false,
                statusCode: 404,
                message: "User not found",
            });
        }

        // Check if the old password matches
        const passwordMatch = await bcrypt.compare(old_password, user.password);

        if (!passwordMatch) {
            return res.status(401).send({
                status: false,
                statusCode: 401,
                message: "Incorrect old password",
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update the user's password field
        user.password = hashedPassword;

        await user.save();

        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Password changed successfully",
        });
    } catch (e: any) {
        logger.error(e);

        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Internal server error",
        });
    }
}

