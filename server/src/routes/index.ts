import { Router } from "express";
import { dsnRouter } from "./dsn.routes.js";

export const apiRouter = Router();

apiRouter.use("/dsn", dsnRouter);
