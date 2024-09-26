import express, { Request, Response} from "express";
import authRoutes from "./auth/index"
import walletRoutes from "./wallet/index"
import transactionRoutes from "./transactions/index"

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
    res.json({ message: "The Fintech API"})
})

router.use("/auth", authRoutes)
router.use("/wallet", walletRoutes)
router.use("/transactions", transactionRoutes)

export default  router;