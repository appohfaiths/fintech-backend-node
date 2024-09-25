import { Request, Response} from "express";
import asyncHandler from "express-async-handler";
import {Repository} from "typeorm";
import {Wallet} from "../../entity/Wallet";
import {User} from "../../entity/User";
import {AppDataSource} from "../../config/data-source";
import {sendEmail} from "../../utils/sendEmail";

const walletRepository: Repository<Wallet> = AppDataSource.getRepository(Wallet);
const userRepository: Repository<User> = AppDataSource.getRepository(User);

// @desc create wallet
// @route POST /api/wallet
// @access Private
export const createNewWallet = asyncHandler(async ( req: Request, res: Response) => {
    const { balance, currency, userId} = req.body;
    if(!userId) {
        res.status(400).json({ message: "Cannot create wallet without user Id"});
    }

    const user = await userRepository.findOne(userId);
    if(!user) return;

    const wallet = new Wallet();
    wallet.user = user;
    wallet.balance = balance ?? 0;
    wallet.currency = currency ?? "USD";

    try {
        const createWalletResponse = await walletRepository.save(wallet);
        if(createWalletResponse){
            const emailResponse = await sendEmail({
                toEmail: user.email,
                subject: "Your New Wallet is Ready!",
                data: {
                    username: user.username,
                },
                template: "NewWalletCreated.html"
            })
            res.status(201).json({ message: "Wallet created successfully"});
        } else {
            res.status(400).json({ message: "Failed to create wallet"});
        }
    } catch(error) {
        if(error instanceof  Error) {
            res.status(500).json({ message: error.message});
        } else {
            res.status(500).json({ message: "An unknown error occurred"});
        }
    }

})

// @desc get wallet
// @route GET /api/wallet/:id
// @access Private

// @desc get wallets
// @route GET /api/wallets
// @access Private