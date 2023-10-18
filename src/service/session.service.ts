import { FilterQuery, UpdateQuery } from "mongoose";
import config from "config";
import { get } from "lodash";

import { findUser } from "./user.service";
import { UserDocument } from "../models/user.model";
import Session, { SessionDocument } from "../models/session.model";
import { decodeJwt, signJwt } from "../utils/jwt.utils";

export async function createSession(userId: string, userAgent: string) {
    const session = await Session.create({ user: userId, userAgent });

    return session.toJSON();
}

export function createAccessToken({
    user,
    session,
}: {
    user:
    | Omit<UserDocument, "password">
    | Omit<UserDocument, "password">;
    session:
    | Omit<SessionDocument, "password">
    | Omit<SessionDocument, "password">;
}) {
    // Build and return the new access token
    const accessToken = signJwt(
        { ...user, session: session._id },
        { expiresIn: config.get("accessTokenTtl") } // 15 minutes
    );

    return accessToken;
}

export async function reIssueAccessToken({
    refreshToken,
}: {
    refreshToken: string;
}) {
    // Decode the refresh token
    const { decoded } = decodeJwt(refreshToken);

    if (!decoded || !get(decoded, "_id")) return false;

    // Get the session
    const session = await Session.findById(get(decoded, "_id"));

    // Make sure the session is still valid
    if (!session || !session?.valid) return false;

    const user = await findUser({ _id: session.user });

    if (!user) return false;

    const accessToken = createAccessToken({ user, session });

    return accessToken;
}

export async function updateSession(
    query: FilterQuery<SessionDocument>,
    update: UpdateQuery<SessionDocument>
) {
    return Session.updateOne(query, update);
}

export async function findSessions(query: FilterQuery<SessionDocument>) {
    return Session.find(query).lean();
}