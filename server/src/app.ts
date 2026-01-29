import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "./config/index.js";
import { apiRouter } from "./routes/index.js";
import { routeNotFoundMiddleware } from "./middlewares/routeNotFound.middleware.js";
import { globalErrorMiddleware } from "./middlewares/globalError.middleware.js";

export const app = express();

// Middlewares
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json({ limit: "10mb" }));

// Health check route
apiRouter.get("/health", (_req: Request, res: Response) => {
  return res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Api Routes
app.use("/api", apiRouter);

// 404 handler for unknown routes
apiRouter.use(routeNotFoundMiddleware);
// Global error handler
apiRouter.use(globalErrorMiddleware);
