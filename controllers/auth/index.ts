import { Request, Response} from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import {generateToken} from "../../utils/generateToken";
import {sendEmail} from "../../utils/sendEmail";
import {User} from "../../entity/User";
import {AppDataSource} from "../../config/data-source";
import {ApiResponse} from "../../types/utils";

const userRepository = AppDataSource.getRepository(User);

// @desc Register user
// @route POST /api/auth/register
// @access Public
export const register = asyncHandler(async ( req: Request, res: Response) => {
    const { email, username, password} = req.body;

    if(!email || !username || !password) {
        res.status(400).json({ message: "Please provide all fields"});
    }

    const userExists = await userRepository.findOneBy({ email});
    if(userExists) {
        res.status(400).json({ message: "User already exists"});
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

    console.log(createUserResponse)
    if(!createUserResponse) return;
    const emailResponse = await sendEmail({
        toEmail: email,
        subject: "Verify your email",
        data: {
            username,
            emailConfirmationUrl: `http://localhost:8181/api/auth/verify-email/${createUserResponse.id}`
        },
        template: "RegisterUser.html"
    })
    if(emailResponse.code === 200){
        res.status(201).json({ message: "User registered successfully"});
    } else if (emailResponse.code === 400) {
        res.status(400).json({ message: "An error occurred while sending email"});
    } else {
        res.status(500).json({ message: "An unknown error occurred"});
    }

})