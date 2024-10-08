import { Request, Response} from "express";
import asyncHandler from "express-async-handler";
import { v4 as uuidv4 } from 'uuid';
import {Repository} from "typeorm";
import {Transaction} from "../../entity/Transaction";
import {Wallet} from "../../entity/Wallet";
import {User} from "../../entity/User";
import {AppDataSource} from "../../config/data-source";
import {sendEmail} from "../../utils/sendEmail";
import {APIResponse} from "../../types/utils";
import {formatDate} from "../../utils/utils";

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
        res.status(400).json({ message: "Cannot send money without sender and receiver wallet Id", code: 400 } as APIResponse);
        return
    }

    if(senderWalletId === receiverWalletId) {
        res.status(400).json({ message: "Sender and Receiver wallet are the same", code: 400 } as APIResponse);
        return
    }

    const senderWallet = await walletRepository.findOneBy({id: senderWalletId});
    const receiverWallet = await walletRepository.findOneBy({id: receiverWalletId});


    if(!senderWallet || !receiverWallet) {
        res.status(400).json({ message: "Sender or receiver wallet not found", code: 400 } as APIResponse);
        return;
    }

    const existingTransactionByIdempotencyKey = await transactionRepository.findOneBy({ idempotencyKey});
    if(existingTransactionByIdempotencyKey){
        res.set('Idempotent-Replayed', "true")
        res.status(400).json({
            message: "This transaction already exists",
            data: {
                ...existingTransactionByIdempotencyKey
            },
            code: 400,
        })
        return;
    }
    const parsedAmount = parseFloat(amount);
    const parsedSenderBalance = parseFloat(senderWallet.balance.toString());
    if(parsedSenderBalance < parsedAmount) {
        res.status(400).json({ message: "Insufficient funds", code: 400 } as APIResponse);
        return;
    }

    const transaction = new Transaction();
    transaction.sender = await userRepository.findOne({
        where: { wallet: { id: senderWalletId } },
        relations: ["wallet"]
    }) as unknown as User;
    transaction.recipient = await userRepository.findOne({
        where: { wallet: { id: receiverWalletId } },
        relations: ["wallet"]
    }) as unknown as User;
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
            res.status(201).json({
                message: "Transaction successful",
                data: {
                    id: createTransactionResponse.id,
                    amount: createTransactionResponse.amount,
                    date: createTransactionResponse.createdAt,
                    sender: createTransactionResponse.sender.username,
                    recipient: createTransactionResponse.recipient.username,
                    createdAt: createTransactionResponse.createdAt,
                    idempotencyKey: createTransactionResponse.idempotencyKey
                },
                code: 201} as APIResponse);
            await sendEmail({
                toEmail: transaction.sender.email,
                subject: "Transaction Alert",
                data: {
                    username: transaction.sender.username,
                    amount: transaction.amount,
                    currency_symbol: "$",
                    currency: "USD",
                    counterparty_type: "Recipient",
                    counterparty_name: transaction.recipient.username,
                    transaction_type: "debited",
                    transaction_id: transaction.id,
                    transaction_date: formatDate(transaction.createdAt)
                },
                template: "TransactionNotification.html"
            });
            await sendEmail({
                toEmail: transaction.recipient.email,
                subject: "Transaction Alert",
                data: {
                    username: transaction.recipient.username,
                    amount: transaction.amount,
                    currency_symbol: "$",
                    currency: "USD",
                    counterparty_type: "Sender",
                    counterparty_name: transaction.sender.username,
                    transaction_type: "credited",
                    transaction_id: transaction.id,
                    transaction_date: formatDate(transaction.createdAt)
                },
                template: "TransactionNotification.html"
            });
        } else {
            res.status(400).json({ message: "Failed to create transaction", code: 400 } as APIResponse);
        }
    } catch(error) {
        if(error instanceof  Error) {
            res.status(500).json({ message: error.message, code: 500 } as APIResponse);
        } else {
            res.status(500).json({ message: "An unknown error occurred", code: 500 } as APIResponse);
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
        return;
    }

    const user = await userRepository.findOneBy({id: userId});
    if(!user) {
        res.status(404).json({ message: "User not found", code: 404} as APIResponse);
        return;
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
        res.status(404).json({ message: "No transactions found", code: 404 } as APIResponse);
        return;
    }

    const transactionsWithDetails = transactions.map(transaction => {
        const isSender = transaction.sender.id === userId;
        return {
            id: transaction.id,
            amount: transaction.amount,
            createdAt: formatDate(transaction.createdAt),
            role: isSender ? 'sender' : 'recipient',
            type: isSender ? 'debit' : 'credit',
            sender: {
                id: transaction.sender.id,
                username: transaction.sender.username,
                email: transaction.sender.email
            },
            recipient: {
                id: transaction.recipient.id,
                username: transaction.recipient.username,
                email: transaction.recipient.email
            }
        };
    });

    res.status(200).json({
        message: "Transactions retrieved successfully",
        code: 200,
        data: transactionsWithDetails
    } as APIResponse);
})