# x402 with Coinbase Facilitator

Pay-per-request API using Coinbase's official x402 libraries with Coinbase's facilitator using USDC and a Solana wallet.

## Quickstart

From the project root:

```bash
npm install
```

### Step 1: Start the x402 server

```bash
npm run start:server
```

### Step 2: Run the client to test the premium service endpoint

```bash
npm run start:client
```

### Notes

The client and receiver wallet needs USDC for payments.
You can fund both wallets with USDC via: https://faucet.circle.com/
You do not need SOL in the client wallet because the facilitator pays the fee.
