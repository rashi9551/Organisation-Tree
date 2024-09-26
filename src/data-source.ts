import "reflect-metadata";
import { DataSource } from "typeorm";
import { Node } from "./entity/org-tree";  // Adjust the path based on your project structure
import * as dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: "user",
    synchronize: true,  // Set to true for initial sync
    logging: false,
    entities: [Node],
    migrations: ["./src/migration/*.ts"],
    subscribers: [],
});

