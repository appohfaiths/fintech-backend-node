require("dotenv").config()
import express from "express";
import {sendMoney, getUserTransactions} from "../../controllers/transactions";

const router = express.Router()

/**
 * @swagger
 * /api/transactions/send:
 *  post:
 *      summary: Send money to another user
 *      description: Send money to another user
 *      tags:
 *          - Transactions
 *      parameters:
 *        - in: body
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *               senderWalletId:
 *                    type: string
 *               receiverWalletId:
 *                    type: string
 *               amount:
 *                    type: number
 *               idempotencyKey:
 *                    type: string
 *      responses:
 *          200:
 *             description: Money sent successfully
 *          400:
 *             description: Bad request
 */
router.post("/send", sendMoney);

/**
 * @swagger
 * /api/transactions/{id}:
 *  get:
 *      summary: Get user transactions
 *      description: Get user transactions
 *      tags:
 *          - Transactions
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *            description: User id
 *      responses:
 *          200:
 *             description: User transactions retrieved successfully
 *          400:
 *             description: Bad request
 */
router.get("/:id", getUserTransactions);

export default router