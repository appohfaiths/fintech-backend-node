import { Request, Response} from "express";
import asyncHandler from "express-async-handler";
import { v4 as uuidv4 } from 'uuid';
import {Repository} from "typeorm";
import {Transaction} from "../../entity/Transaction";
import {Wallet} from "../../entity/Wallet";
import {User} from "../../entity/User";
import {AppDataSource} from "../../config/data-source";
import {sendEmail} from "../../utils/sendEmail";

const transactionRepository: Repository<Transaction> = AppDataSource.getRepository(Transaction);
const walletRepository: Repository<Wallet> = AppDataSource.getRepository(Wallet);
const userRepository: Repository<User> = AppDataSource.getRepository(User);

// @desc send money
// @route POST /api/transactions/send
// @access Private
export const sendMoney = asyncHandler(async ( req: Request, res: Response) => {
    const { amount, senderWalletId, receiverWalletId, idempotencyKey} = req.body;
    // const idempotencyKey = req.headers['idempotency-key'] as string

    if(!senderWalletId || !receiverWalletId) {
        res.status(400).json({ message: "Cannot send money without sender and receiver wallet Id"});
    }

    const senderWallet = await walletRepository.findOneBy({id: senderWalletId});
    const receiverWallet = await walletRepository.findOneBy({id: receiverWalletId});


    if(!senderWallet || !receiverWallet) {
        res.status(400).json({ message: "Sender or receiver wallet not found"});
    }

    const existingTransactionByIdempotencyKey = await transactionRepository.findOneBy({ idempotencyKey});
    if(existingTransactionByIdempotencyKey){
        res.set('Idempotent-Replayed', "true")
        res.status(400).json({
            message: "This transaction already exists",
            data: existingTransactionByIdempotencyKey
        })
        return;
    }
    const parsedAmount = parseFloat(amount);
    const parsedSenderBalance = parseFloat(senderWallet.balance.toString());
    if(parsedSenderBalance < parsedAmount) {
        res.status(400).json({ message: "Insufficient funds"});
    }

    const transaction = new Transaction();
    transaction.sender = await userRepository.findOne({
        where: { wallet: { id: senderWalletId } },
        relations: ["wallet"]
    });
    transaction.recipient = await userRepository.findOne({
        where: { wallet: { id: receiverWalletId } },
        relations: ["wallet"]
    });
    transaction.amount = parsedAmount;
    transaction.createdAt = new Date();
    transaction.idempotencyKey = idempotencyKey ?? uuidv4();

    try {
        const createTransactionResponse = await transactionRepository.save(transaction);
        if(createTransactionResponse){
            senderWallet.balance = parseFloat(senderWallet.balance.toString()) - parsedAmount;
            receiverWallet.balance = parseFloat(receiverWallet.balance.toString()) + parsedAmount;
            await walletRepository.save(senderWallet);
            await walletRepository.save(receiverWallet);
            res.status(201).json({ message: "Transaction successful", data: createTransactionResponse});
        } else {
            res.status(400).json({ message: "Failed to create transaction"});
        }
    } catch(error) {
        if(error instanceof  Error) {
            res.status(500).json({ message: error.message});
        } else {
            res.status(500).json({ message: "An unknown error occurred"});
        }
    }

})

// @desc get user transactions
// @route GET /api/transactions/:id
// @access Private
export const getUserTransactions = asyncHandler( async(req: Request, res: Response) => {
    const userId = req.params.id;
    if(!userId) {
        res.status(400).json({ message: "Cannot get transactions without user Id"});
    }

    const user = await userRepository.findOneBy({id: userId});
    if(!user) {
        res.status(404).json({ message: "User not found"});
    }

    const transactions = await transactionRepository.find({
        where: [
            { sender: user},
            { recipient: user}
        ],
        order: { createdAt: 'DESC'},
        relations: ["sender", "recipient"]
    });

    if(!transactions) {
        res.status(404).json({ message: "No transactions found"});
        return;
    }

    const transactionsWithDetails = transactions.map(transaction => {
        const isSender = transaction.sender.id === userId;
        return {
            ...transaction,
            role: isSender ? 'sender' : 'recipient',
            type: isSender ? 'debit' : 'credit'
        };
    });

    res.status(200).json({
        message: "Transactions retrieved successfully",
        data: transactionsWithDetails
    });
})