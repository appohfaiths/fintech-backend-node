import "reflect-metadata"
import express, { Express} from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import routes from "./routes/index";
import {AppDataSource} from "./config/data-source";

if (process.env.NODE_ENV === "development") {
    dotenv.config();
}

const app: Express = express();
const PORT: string | number = process.env.PORT ?? 8080;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", routes);

AppDataSource.initialize().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})