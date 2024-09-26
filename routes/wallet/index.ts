require("dotenv").config()
import express from "express";
import {createNewWallet, getWallet, updateWallet} from "../../controllers/wallet";

const router = express.Router();

router.post("/", createNewWallet);
router.route("/:id").get(getWallet).put(updateWallet);

export default router;