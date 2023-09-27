import { Request, Response } from "express";
import { omit } from "lodash";
import { createUser, findUser } from "../service/user.service";
import UserModel, { UserDocumentWithResetToken } from "../models/user.model"; import crypto, { randomBytes } from 'crypto'
import nodemailer from 'nodemailer'
import logger from "../utils/logger";
import config from "config";


export async function createUserHandler(req: Request, res: Response) {
    try {
        // Check if a user with the same email already exists in the database
        const existingUser = await findUser({ email: req.body.email });

        if (existingUser) {
            // If a user with the same email exists, return an error message
            return res.status(409).send({
                status: false,
                statusCode: 409,
                message: "User with this email already exists"
            });
        }

        const user = await createUser(req.body);

        const userWithoutPassword = omit(user.toJSON(), "password");


        return res.status(201).send({
            status: true,
            statusCode: 201,
            message: "User created successfully",
            data: [userWithoutPassword],
        });
    } catch (e: any) {
        logger.error(e);
        return res.status(409).send(e.message);
    }
}


export async function resetUserPasswordHandler(req: Request, res: Response) {

    const { email } = req.body;

    try {
        //find user by email
        const user: UserDocumentWithResetToken | null = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).send({
                status: false,
                statusCode: 404,
                message: "User not found"
            });
        }

        //Generate a secure reset token
        const resetToken: string = crypto.randomBytes(20).toString('hex');

        // Calculate the expiration time (1 hour from now)
        const expirationTime = new Date();
        expirationTime.setTime(expirationTime.getTime() + 3600000);

        //Store the reset token in the user document
        user.resetToken = resetToken;
        user.resetTokenExpiration = expirationTime;

        await user.save();

        // const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;

        // Send an email to the user with a link containing the reset token
        const transporter = nodemailer.createTransport({
            // Set up your email transporter (e.g., SMTP or other)
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            secure: false,
            auth: {
                // TODO: replace `user` and `pass` values from <https://forwardemail.net>
                user: "20c1120a915243",
                pass: "f0a99f3c2cccfe",
            },
            tls: {
                ciphers: 'SSLv3'
            }
        });

        const mailOptions = {
            to: email,
            from: 'NHIDS support<support@nhids.com>',
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n`
                + `Please click on the following link or paste it into your browser to complete the process:\n\n`
                + `http://${req.headers.host}/reset/${resetToken}\n\n`
                + `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            status: true,
            statusCode: 200,
            message: 'Password reset instructions sent to your email'
        })


    } catch (e: any) {
        logger.info(e)

        res.status(500).json({
            status: false,
            statusCode: 500,
            message: 'Internal server error'
        })
    }

    //mailtrap for mailbox
}


export async function getAllUsers(req: Request, res: Response) {
    try {
        const users = await UserModel.find();
        res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Users retrieved successfully",
            data: users,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Internal server error",
        });
    }
}