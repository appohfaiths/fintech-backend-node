import express, { Request, Response} from "express";
import authRoutes from "./auth/index"

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
    res.json({ message: "The Fintech API"})
})

router.use("/auth", authRoutes)

export default  router;