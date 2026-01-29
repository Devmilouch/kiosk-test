import { Request, Response } from "express";

export const routeNotFoundMiddleware = (req: Request, res: Response) => {
  return res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
  });
};
