require("dotenv").config()
import express from "express";
import {createNewWallet, getWallet, updateWallet} from "../../controllers/wallet";

const router = express.Router();

/**
 * @swagger
 * /api/wallet:
 *  post:
 *      summary: Create a new wallet
 *      description: Create a new wallet
 *      tags:
 *          - Wallet
 *      parameters:
 *        - in: body
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *               userId:
 *                    type: string
 *               balance:
 *                    type: number
 *               currency:
 *                    type: string
 *      responses:
 *          201:
 *             description: Wallet created successfully
 *          400:
 *             description: Bad request
 */
router.post("/", createNewWallet);

/**
 * @swagger
 * /api/wallet/{id}:
 *  get:
 *      summary: Get wallet
 *      description: Get wallet
 *      tags:
 *          - Wallet
 *      parameters:
 *        - in: path
 *          name: walletId
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *          200:
 *             description: Wallet retrieved successfully
 *          400:
 *             description: Bad request
 */
/**
 * @swagger
 * /api/wallet/{id}:
 *  put:
 *      summary: Update wallet
 *      description: Update wallet
 *      tags:
 *          - Wallet
 *      parameters:
 *        - in: path
 *          name: walletId
 *          required: true
 *          schema:
 *            type: string
 *        - in: body
 *          schema:
 *            type: object
 *            required:
 *              - balance
 *            properties:
 *               balance:
 *                    type: number
 *               currency:
 *                    type: string
 *      responses:
 *          201:
 *             description: Wallet updated successfully
 *          400:
 *             description: Bad request
 */
router.route("/:id").get(getWallet).put(updateWallet);

export default router;