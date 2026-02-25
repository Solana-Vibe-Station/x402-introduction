import { Request, Response } from "express";
import { paymentMiddleware, type SolanaAddress } from "x402-express";
import dotenv from "dotenv";

dotenv.config();

// Define the recipient wallet address
export const RECEIVER = process.env.RECEIVER as SolanaAddress;
export const PRICE = process.env.PRICE as string;
export const DESCRIPTION = process.env.DESCRIPTION as string;
export const NETWORK = "solana-devnet";

// Payment middleware configuration
export const paymentRoute = paymentMiddleware(RECEIVER, {
  "GET /premium": {
    price: `$${PRICE}`, // Price in USD (converted to USDC)
    network: NETWORK, // Solana devnet
    config: { description: DESCRIPTION },
  },
});

// Middleware for error handling
export const errorHandler = (err: Error, req: Request, res: Response) => {
  res.status(500).json({
    success: false,
    message: "Purchase Failed: " + err.message,
    error: process.env.NODE_ENV === "production" ? {} : err.message,
  });
};
