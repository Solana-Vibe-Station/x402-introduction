import { createKeyPairSignerFromBytes, isOffCurveAddress, KeyPairSigner } from "@solana/kit";
import fs from "fs";
import path from "path";
import axios from "axios";
import { withPaymentInterceptor, decodeXPaymentResponse } from "x402-axios";

let KEYPAIR: KeyPairSigner<string>; //wallet/id.json
const SERVICE_URL = "http://localhost:3000";

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
    /** Create Axios 402 client */
    const axios402Client = withPaymentInterceptor(axios.create({ baseURL: SERVICE_URL }), KEYPAIR);

    /** Query root endpoint to see if accessible */
    console.log("✅ Verifying service...");
    const freeReponse = await axios402Client.get("/");
    console.log(`${freeReponse.data.message}\n`);

    /** Access Premium endpoint  */
    console.log("✅ Accessing Premium service...");
    const premiumResponse = await axios402Client.get("/api/premium");
    console.log("✅ Payment successful!");
    console.log(`🏆Tokens:`, premiumResponse.data.tokens);

    /** Get Payment confirmation */
    const paymentResponse = premiumResponse.headers["x-payment-response"];
    if (paymentResponse) {
      const decoded = decodeXPaymentResponse(paymentResponse);
      console.log(`Transaction: https://explorer.solana.com/tx/${decoded.transaction}?cluster=devnet\n`);
    }
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
