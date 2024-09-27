require("dotenv").config()
import express from "express";
import {register, verifyEmail} from "../../controllers/auth";

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *  post:
 *      summary: Register a new user
 *      description: Register a new user
 *      tags:
 *          - Auth
 *      parameters:
 *        - in: body
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *               email:
 *                    type: string
 *               username:
 *                    type: string
 *               password:
 *                    type: string
 *      responses:
 *          200:
 *             description: User registered successfully
 *          400:
 *             description: Bad request
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/verify-email/{id}:
 *  post:
 *      summary: Verify user email
 *      description: Verify user email
 *      tags:
 *          - Auth
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *            description: User id
 *      responses:
 *          200:
 *             description: User email verified successfully
 *          400:
 *             description: Bad request
 */
router.post("/verify-email/:id", verifyEmail);

export default router;