require("dotenv").config()
import express from "express";
import {register} from "../../controllers/auth";

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

export default router;