# x402 Introduction Projects

This repository contains two implementations of pay-per-request APIs using x402 on Solana devnet:

## Projects

### 1. Coinbase Facilitator

Located in the [coinbase-facilitator](./coinbase-facilitator) directory.

This implementation uses Coinbase's official x402 libraries with Coinbase's facilitator using USDC and a Solana wallet.

Key features:

- Uses Coinbase's official facilitator service
- Requires USDC for payments
- Facilitator pays the transaction fees

### 2. Custom Solana Facilitator

Located in the [custom-sol-facilitator](./custom-sol-facilitator) directory.

This implementation uses x402 with a custom facilitator service on Solana devnet.

Key features:

- Uses a custom facilitator implementation
- Demonstrates how to build your own facilitator service

## Getting Started

Each project has its own README with specific instructions:

- [Coinbase Facilitator README](./coinbase-facilitator/README.md)
- [Custom Solana Facilitator README](./custom-sol-facilitator/README.md)

## Requirements

- Node.js
- npm
- Solana wallet with USDC (for testing)

## Funding

- You can fund test wallets with USDC via: https://faucet.circle.com/
- You can fund test wallets with SOL via: https://faucet.solana.com/
