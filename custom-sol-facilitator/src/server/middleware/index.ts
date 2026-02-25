import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import {
  Address,
  Base64EncodedWireTransaction,
  createSolanaRpc,
  decompileTransactionMessage,
  getCompiledTransactionMessageDecoder,
  getTransactionDecoder,
} from "@solana/kit";

dotenv.config();

// Define the recipient wallet address
const SERVICE_WALLET = process.env.SERVICE_WALLET as Address;
const SERVICE_PRICE_LAMPORTS = process.env.SERVICE_PRICE_LAMPORTS as string;
const CLUSTER = process.env.CLUSTER as string;
const RPC_URL = process.env.RPC_URL as string;

type PaymentDataType = {
  x402Version: number;
  scheme: string;
  network: string;
  payload: {
    serializedTransaction: Base64EncodedWireTransaction;
  };
};

export const paymentRoute = async (req: Request, res: Response, next: NextFunction) => {
  // Get the payment header
  const x402Header = req.header("X-Payment");
  if (!x402Header) {
    // No payment received, return 402 payment details
    console.log("👉 Request missing X-Payment header. Responding with payment details.");
    return res.status(402).json({
      payment: {
        recipient: SERVICE_WALLET,
        amount: SERVICE_PRICE_LAMPORTS,
        cluster: CLUSTER,
      },
    });
  }

  // Decode base64 and parse JSON (x402 standard)
  const { network, payload, scheme, x402Version } = JSON.parse(Buffer.from(x402Header, "base64").toString("utf-8")) as PaymentDataType;

  // Log payment details for demonstration
  console.log("✅ Received potential payment with the following details:");
  console.log(`   - Network: ${network}`);
  console.log(`   - Scheme: ${scheme}`);
  console.log(`   - x402 Version: ${x402Version}`);
  console.log(`   - Transaction: ${payload.serializedTransaction}`);

  const transactionBytes = Uint8Array.from(Buffer.from(payload.serializedTransaction, "base64"));
  const transaction = getTransactionDecoder().decode(transactionBytes);
  const compiledTransactionMessage = getCompiledTransactionMessageDecoder().decode(transaction.messageBytes);
  const transactionMessage = decompileTransactionMessage(compiledTransactionMessage);

  console.log("🔍 Verify transaction details");

  /** Return invalid Transaction */
  const transferInstruction = transactionMessage.instructions.find((ix) => ix.programAddress === "11111111111111111111111111111111");
  if (!transferInstruction?.accounts || !transferInstruction?.data) {
    return res.status(400).json({ message: "Invalid transaction: No valid transfer instruction found." });
  }

  /** Return invalid Transaction if too many accounts in transfer instruction (potentially malicious) */
  if (transferInstruction?.accounts.length > 2) {
    return res.status(400).json({ message: "Invalid transaction: Too many accounts in transfer instruction." });
  }

  /** Return invalid Transaction if no transfer to service wallet */
  const transferToServiceWallet = transferInstruction?.accounts.find((account) => account.address === SERVICE_WALLET);
  if (!transferToServiceWallet) {
    return res.status(400).json({ message: "Invalid transaction: No transfer to service wallet found." });
  }

  /** Return invalid transaction if the price is not correct */
  const dataBuffer = Buffer.from(transferInstruction.data);
  const amount = dataBuffer.readBigUInt64LE(4);
  if (amount !== BigInt(SERVICE_PRICE_LAMPORTS)) {
    return res.status(400).json({ message: "Invalid transaction: Incorrect payment amount." });
  }

  /** Create RPC connection and send */
  const rpc = createSolanaRpc(RPC_URL);
  const signature = await rpc.sendTransaction(payload.serializedTransaction, { encoding: "base64" }).send();
  console.log(`🚀 Payment transaction sent with signature: ${signature}`);

  // Call next() to proceed to the controller
  next();
};

// Middleware for error handling
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    message: "Purchase Failed: " + err.message,
    error: process.env.NODE_ENV === "production" ? {} : err.message,
  });
};
