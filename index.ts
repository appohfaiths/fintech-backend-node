import "reflect-metadata"
import express, { Express} from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import routes from "./routes/index";
import {AppDataSource} from "./config/data-source";
import swaggerApp from './swagger'
import {errorHandler} from "./middleware/errorHandler";

if (process.env.NODE_ENV === "development") {
    dotenv.config();
}

const app: Express = express();
const PORT: string | number = process.env.PORT ?? 8080;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use("/api", routes);
app.use("/api/docs", swaggerApp);
app.use(errorHandler);

AppDataSource.initialize().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})