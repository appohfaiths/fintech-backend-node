import express, { Request, Response} from "express";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
    res.json({ message: "The Fintech API"})
})

export default  router;