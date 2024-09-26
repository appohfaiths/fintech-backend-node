require("dotenv").config()
import express from "express";
import {sendMoney, getUserTransactions} from "../../controllers/transactions";

const router = express.Router()

router.post("/send", sendMoney);
router.get("/:id", getUserTransactions);

export default router