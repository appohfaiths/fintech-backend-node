require('dotenv').config();
import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "../entity/User"
import {Wallet} from "../entity/Wallet";
import {Transaction} from "../entity/Transaction";
import {SetupTables1727224144253} from "../migration/1727224144253-SetupTables";
import * as process from "node:process";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: 5432,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    synchronize: false,
    logging: false,
    entities: [User, Wallet, Transaction],
    migrations: [SetupTables1727224144253],
    subscribers: [],
    ssl: {
        rejectUnauthorized: false
    }
})
