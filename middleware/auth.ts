import { Request, Response, NextFunction } from 'express';
import jwt, {Secret, JwtPayload} from 'jsonwebtoken';
import {Repository} from "typeorm";
import asyncHandler from 'express-async-handler';
import {User} from "../entity/User";
import {AppDataSource} from "../config/data-source";

const userRepository: Repository<User> = AppDataSource.getRepository(User);

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let token: string;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // get token from the header
            token = req.headers.authorization.split(' ')[1];
            // verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET as Secret) as JwtPayload;
            // get user from token
            req.body.user = await userRepository.findOneBy({id: decoded.id});
            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized');
        }
    }
    if (!token) {
        res.status(401);
        throw new Error('Not authorized');
    }
})