import {
  address,
  appendTransactionMessageInstructions,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createTransactionMessage,
  getBase64EncodedWireTransaction,
  isOffCurveAddress,
  KeyPairSigner,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";
import fs from "fs";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

let KEYPAIR: KeyPairSigner<string>; //wallet/id.json
const SERVICE_URL = process.env.SERVICE_URL as string;
const SERVICE_PRICE_LAMPORTS = process.env.SERVICE_PRICE_LAMPORTS as string;
const SERVICE_WALLET = process.env.SERVICE_WALLET as string;
const RPC_URL = process.env.RPC_URL as string;
const CLUSTER = process.env.CLUSTER as string;

export async function initWallet() {
  const resolvedPath = path.resolve(`./src/wallet/id.json`);
  const loadedKeyBytes = Uint8Array.from(JSON.parse(fs.readFileSync(resolvedPath, "utf8")));
  KEYPAIR = await createKeyPairSignerFromBytes(loadedKeyBytes);
}

export async function initPayment() {
  if (isOffCurveAddress(KEYPAIR.address)) return;
  console.log("🚀 x402 Solana Client Demo");
  console.log(`💳 Wallet: ${KEYPAIR.address}`);
  console.log(`🏢 Shop: ${SERVICE_URL}\n`);

  try {
    /** Create RPC connection */
    const rpc = createSolanaRpc(RPC_URL);

    /** Get the latest blockhash to include in the transaction */
    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

    /** Creat a transfer instruction */
    const transferInstruction = getTransferSolInstruction({
      source: KEYPAIR,
      destination: address(SERVICE_WALLET),
      amount: BigInt(SERVICE_PRICE_LAMPORTS),
    });

    /** Create Transaction Message */
    const transactionMessage = await pipe(
      createTransactionMessage({ version: "legacy" }),
      (tx) => setTransactionMessageFeePayerSigner(KEYPAIR, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) => appendTransactionMessageInstructions([transferInstruction], tx),
    );

    /** Sign the transaction */
    const signedTransaction = await signTransactionMessageWithSigners(transactionMessage);

    /** Serialize Transaction */
    const serializedTransaction = getBase64EncodedWireTransaction(signedTransaction);

    /** Send X-Payment header with serialized transaction (x402 standard) */
    const paymentProof = {
      x402Version: 1,
      scheme: "exact",
      network: CLUSTER === "devnet" ? "solana-devnet" : "solana-mainnet",
      payload: {
        serializedTransaction: serializedTransaction,
      },
    };

    /** Base64 encode the payment proof */
    const xPaymentHeader = Buffer.from(JSON.stringify(paymentProof)).toString("base64");

    /** Access premium endpoint with payment proof */
    const response = await axios.get(SERVICE_URL, {
      headers: {
        "X-Payment": xPaymentHeader,
      },
    });

    /** Return premium content */
    console.log(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("\n❌ Request failed:");
      console.error(`   Status: ${error.response?.status}`);
      console.error(`   Message: ${JSON.stringify(error.response?.data, null, 2)}`);
      console.error(`   Error message: ${error.message}`);

      if (error.code) {
        console.error(`   Error code: ${error.code}`);
      }

      if (error.response?.status === 402) {
        console.log("\n💡 Possible issues:");
        console.log("   - Insufficient Wallet Balance");
        console.log("   - Get devnet USDC: https://faucet.circle.com/");
        console.log("   - Get devnet SOL: https://faucet.solana.com/");
      }
    } else {
      console.error("Something went wrong:", error);
    }
    process.exit(1);
  }
}

// Initialize the application
initWallet()
  .then(() => {
    return initPayment();
  })
  .catch((err: Error) => {
    console.log("❌ Failed to get tokens from premium service. Error: " + err.message);
    process.exit(1);
  });
