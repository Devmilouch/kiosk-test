import { Router } from "express";
import { uploadSingleFileMiddleware } from "../middlewares/uploadSingleFile.middleware.js";
import { dsnController } from "../controllers/dsn.controller.js";

export const dsnRouter = Router();

dsnRouter.post("/parse", uploadSingleFileMiddleware, dsnController.parseDsnFile);
