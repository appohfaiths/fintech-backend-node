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
 *          - User
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      email:
 *                          type: string
 *                      username:
 *                           type: string
 *                      password:
 *                          type: string
 *          responses:
 *            200:
 *              description: User registered successfully
 *            400:
 *              description: Bad request
 */
router.post("/register", register);
router.post("/verify-email/:id", verifyEmail);

export default router;