import { Request, Response} from "express";
import asyncHandler from "express-async-handler";
import {Repository} from "typeorm";
import {Wallet} from "../../entity/Wallet";
import {User} from "../../entity/User";
import {AppDataSource} from "../../config/data-source";
import {sendEmail} from "../../utils/sendEmail";
import {APIResponse} from "../../types/utils";

const walletRepository: Repository<Wallet> = AppDataSource.getRepository(Wallet);
const userRepository: Repository<User> = AppDataSource.getRepository(User);

// @desc create wallet
// @route POST /api/wallet
// @access Private
export const createNewWallet = asyncHandler(async ( req: Request, res: Response) => {
    const { balance, currency, userId} = req.body;
    if(!userId) {
        res.status(400).json({ message: "Cannot create wallet without user Id", code: 400} as APIResponse);
        return;
    }

    const user = await userRepository.findOneBy({id: userId});
    if(!user) return;

    const wallet = new Wallet();
    wallet.user = user;
    wallet.balance = balance ?? 0;
    wallet.currency = currency ?? "USD";
    wallet.createdAt = new Date();
    wallet.updatedAt = new Date();

    try {
        const createWalletResponse = await walletRepository.save(wallet);
        if(createWalletResponse){
            const emailResponse = await sendEmail({
                toEmail: user.email,
                subject: "Your New Wallet is Ready!",
                data: {
                    username: user.username,
                    walletId: createWalletResponse.id,
                    balance: createWalletResponse.balance,
                    currency: createWalletResponse.currency,
                    currencySymbol: "$"
                },
                template: "NewWalletCreated.html"
            })
            res.status(201).json({
                message: "Wallet created successfully",
                code: 201,
                data: {
                    balance: createWalletResponse.balance,
                    currency: createWalletResponse.currency,
                    id: createWalletResponse.id
                }
            } as APIResponse);
        } else {
            res.status(400).json({ message: "Failed to create wallet", code: 400} as APIResponse);
        }
    } catch(error) {
        if(error instanceof  Error) {
            res.status(500).json({ message: error.message, code: 500} as APIResponse);
        } else {
            res.status(500).json({ message: "An unknown error occurred", code: 500} as APIResponse);
        }
    }

})

// @desc get wallet
// @route GET /api/wallet/:id
// @access Private
export const getWallet = asyncHandler( async(req: Request, res: Response) => {
    const walletId = req.params.id;
    if(!walletId) {
        res.status(400).json({ message: "Cannot get wallet without wallet Id", code: 400} as APIResponse);
    }

    const wallet = await walletRepository.findOneBy({id: walletId});
    if(!wallet) {
        res.status(404).json({ message: "Wallet not found", code: 404} as APIResponse);
    } else {
        res.status(200).json({
            message: "Success",
            code: 200,
            data: {
                balance: wallet.balance,
                currency: wallet.currency
            }
        } as APIResponse);
    }
})

// @desc get wallets
// @route GET /api/wallets
// @access Private

// @desc update wallet
// @route PUT /api/wallet/:id
// @access Private
export const updateWallet = asyncHandler(async (req: Request, res: Response) => {
    const walletId = req.params.id;
    if(!walletId) {
        res.status(400).json({ message: "Cannot update wallet without wallet Id", code: 400} as APIResponse);
    }

    const wallet = await walletRepository.findOneBy({id: walletId});
    if(!wallet) {
        res.status(404).json({ message: "Wallet not found", code: 400 } as APIResponse);
        return;
    }

    const { amount, currency} = req.body;
    if(!amount) {
        res.status(400).json({ message: "Cannot update wallet without amount", code: 400} as APIResponse);
        return;
    }

    const parsedAmount = parseFloat(amount);
    console.log(typeof wallet.balance);
    if(!Number.isNaN(parsedAmount)){
        wallet.balance = parseFloat(wallet.balance.toString()) + parsedAmount;
    }
    wallet.currency = currency ?? wallet.currency;
    wallet.updatedAt = new Date();
    const updateWalletResponse = await walletRepository.save(wallet);
    if(updateWalletResponse) {
        res.status(201).json({
            message: "Wallet updated successfully",
            data: {
                balance: updateWalletResponse.balance,
                currency: updateWalletResponse.currency
            },
            code: 201,
        } as APIResponse);
    } else {
        res.status(400).json({ message: "Failed to update wallet", code: 400} as APIResponse);
    }
})