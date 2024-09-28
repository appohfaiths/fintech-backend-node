import { Request, Response, NextFunction} from "express";
import asyncHandler from "express-async-handler";
import {Repository} from "typeorm";
import bcrypt from "bcryptjs";
import {generateEmailVerificationToken} from "../../utils/generateToken";
import {sendEmail} from "../../utils/sendEmail";
import {User} from "../../entity/User";
import {AppDataSource} from "../../config/data-source";
import {createNewWallet} from "../wallet";
import {APIResponse} from "../../types/utils";

const userRepository: Repository<User> = AppDataSource.getRepository(User);

// @desc Register user
// @route POST /api/auth/register
// @access Public
export const register = asyncHandler(async ( req: Request, res: Response) => {
    const { email, username, password} = req.body;

    if(!email || !username || !password) {
        res.status(400).json({ message: "Please provide all fields", code: 400 } as APIResponse);
        return;
    }

    const userExists = await userRepository.findOneBy({ email});
    if(userExists) {
        res.status(400).json({ message: "User already exists", code: 400} as APIResponse);
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User();
    user.username = username;
    user.email = email;
    user.password = hashedPassword;
    user.isEmailVerified = false;
    user.createdAt = new Date();
    user.updatedAt = new Date();
    const createUserResponse = await userRepository.save(user);

    if(!createUserResponse) {
        res.status(500).json({ message: "Failed to create user", code: 500 } as APIResponse);
        return
    }

    res.status(201).json({
        message: "User created successfully",
        data: {
            id: createUserResponse.id,
            username: createUserResponse.username,
            email: createUserResponse.email,
        },
        code: 201
    } as APIResponse);
    const emailVerificationToken = generateEmailVerificationToken(createUserResponse.id);
    const emailResponse = await sendEmail({
        toEmail: email,
        subject: "Verify your email",
        data: {
            username,
            emailConfirmationUrl: `http://localhost:8181/api/auth/verify-email/${createUserResponse.id}`,
            expirationTime: "10 minutes"
        },
        template: "RegisterUser.html"
    })
    if (emailResponse.code === 400 || emailResponse.code === 500) {
    //     resend email
    }
})

// @desc Verify email
// @route POST /api/auth/verify-email/:id
// @access Private
export const verifyEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = await userRepository.findOneBy({ id});
    if(!user) {
        res.status(404).json({ message: "User not found", code: 404 } as APIResponse);
        return;
    }
    user.isEmailVerified = true;
    user.updatedAt = new Date();
    const updateUserResponse = await userRepository.save(user);
    if(!updateUserResponse) return;

    const walletReq = {
        body: {
            balance: 0, // Default balance
            currency: "USD", // Default currency
            userId: user.id
        }
    } as Request;

    try {
        const createWalletResponse = await createNewWallet(walletReq, res as Response, next as NextFunction);
    } catch(error) {
        if(error instanceof Error){
            res.status(500).json({ message: error.message, code: 500 } as APIResponse);
        } else {
            res.status(500).json({ message: "An unknown error occurred", code: 500 } as APIResponse);
        }
    }
    res.status(200).json({ message: "Email verified successfully", code: 200} as APIResponse);
})