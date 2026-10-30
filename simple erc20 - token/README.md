# Simple ERC-20 Token (STK)

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue.svg)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.29.1-yellow.svg)](https://hardhat.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-5.6.1-red.svg)](https://openzeppelin.com/contracts/)
[![Tests](https://img.shields.io/badge/Tests-18%20Passing-brightgreen.svg)]()
[![Network](https://img.shields.io/badge/Network-Ethereum%20Sepolia-orange.svg)]()

A complete, beginner-friendly, production-grade **ERC-20 smart contract project** developed for an **IEEE Blockchain Application**. 

This project demonstrates foundational decentralized finance (DeFi) principles by implementing an audited, standard-compliant fungible token using **OpenZeppelin Contracts v5** and **Hardhat**.

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Token Specifications](#-token-specifications)
3. [Project Directory Structure](#-project-directory-structure)
4. [Prerequisites](#-prerequisites)
5. [Installation & Setup](#-installation--setup)
6. [Smart Contract Architecture](#-smart-contract-architecture)
7. [Automated Testing Suite](#-automated-testing-suite)
8. [Local Deployment Simulation](#-local-deployment-simulation)
9. [Sepolia Testnet Deployment Guide](#-sepolia-testnet-deployment-guide)
10. [MetaMask Configuration](#-metamask-configuration)
11. [Security Best Practices](#-security-best-practices)
12. [IEEE Viva & Interview Preparation](#-ieee-viva--interview-preparation)

---

## 🚀 Project Overview

The **Simple ERC-20 Token (`STK`)** is an educational, production-ready implementation of Ethereum's EIP-20 standard. Rather than writing a vulnerable custom token standard from scratch, this project utilizes **OpenZeppelin's battle-tested ERC-20 implementation**, protecting against common vulnerabilities such as integer overflows, reentrancy, and unauthorized delegated balance manipulations.

### Core Capabilities:
- **Balance Inquiries (`balanceOf`)**: Constant-time $O(1)$ query of any address's token holdings.
- **Direct Transfers (`transfer`)**: Safe transfer of tokens from the caller's address to a recipient.
- **Delegated Spending (`approve` & `allowance`)**: Permission mechanism allowing smart contracts (such as decentralized exchanges or staking pools) to spend tokens on a user's behalf.
- **Delegated Execution (`transferFrom`)**: Secure two-step escrow transfer executing against a previously authorized allowance.
- **ERC-6093 Modern Custom Errors**: Low-gas custom reverts (`ERC20InsufficientBalance`, `ERC20InsufficientAllowance`) instead of expensive legacy string error messages.

---

## 💎 Token Specifications

| Parameter | Value | Technical Detail |
| :--- | :--- | :--- |
| **Token Name** | `Simple Token` | Full descriptive name |
| **Token Symbol** | `STK` | Ticker symbol on wallets and explorers |
| **Decimals** | `18` | Standard Ethereum precision ($10^{18}$ base units = 1 token) |
| **Initial Supply** | `1,000,000 STK` | Scaled to $1,000,000 \times 10^{18}$ raw units (`wei`) |
| **Initial Recipient** | Deployer Address | All minted tokens are assigned to `msg.sender` |
| **Solidity Version** | `^0.8.20` | Includes built-in arithmetic overflow/underflow checks |
| **Standard Framework** | OpenZeppelin v5 | Industry standard for secure EVM contracts |

---

## 📁 Project Directory Structure

```text
simple-erc20-token/
├── contracts/
│   └── SimpleToken.sol        # Core ERC-20 smart contract
├── test/
│   └── SimpleToken.test.js    # Comprehensive automated test suite (18 tests)
├── scripts/
│   └── deploy.js              # Multi-network deployment script (Local / Sepolia)
├── hardhat.config.js          # Hardhat configuration (Solidity compiler & networks)
├── package.json               # Node.js dependencies and operational scripts
├── .env.example               # Template for environment variables (safe to commit)
├── .gitignore                 # Ignores secrets (.env), node_modules, and build cache
├── PROJECT_REPORT.md          # In-depth IEEE technical report and interview guide
└── README.md                  # Complete documentation and setup manual
```

---

## ⚙️ Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.x`, `v20.x`, or `v22.x+` (check with `node -v`)
- **npm**: `v9.x` or later (check with `npm -v`)
- **MetaMask Wallet**: Browser extension with a **dedicated test account**
- **Sepolia Test ETH**: Required only for testnet deployment (never real money!)

---

## 📦 Installation & Setup

1. **Navigate to the project directory**:
   ```bash
   cd "simple erc20 - token"
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Compile the smart contracts**:
   ```bash
   npm run compile
   ```
   *Output should indicate: `Compiled 6 Solidity files successfully`.*

---

## 🛡️ Smart Contract Architecture

The contract inherits OpenZeppelin's `ERC20` base contract:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SimpleToken is ERC20 {
    constructor() ERC20("Simple Token", "STK") {
        // Mint 1,000,000 tokens with 18 decimal places to the deployer
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }
}
```

### Why OpenZeppelin?
In an IEEE evaluation, writing custom ERC-20 accounting from scratch introduces significant security risks:
- Missing event emissions (`Transfer`, `Approval`).
- Missing allowance balance checks.
- Zero-address transfer vulnerabilities.
- Higher gas costs due to unoptimized storage slot operations.

Using OpenZeppelin ensures mathematical soundness, gas optimization, and adherence to the latest Ethereum Improvement Proposals.

---

## 🧪 Automated Testing Suite

We maintain an automated suite of **18 tests** using Hardhat, Mocha, Chai, and Ethers.js v6.

### Run the test suite:
```bash
npm test
```

### Test Coverage Summary:
```text
  SimpleToken (STK) ERC-20 Contract
    1. Deployment & Metadata Verification
      ✔ Should configure the correct token name
      ✔ Should configure the correct token symbol
      ✔ Should configure standard 18 decimal places
      ✔ Should mint exactly 1,000,000 tokens as the total supply
      ✔ Should assign the entire initial supply to the deploying account
    2. Balance Checking & Direct Token Transfers (`transfer`)
      ✔ Should transfer tokens between accounts and update balances correctly
      ✔ Should emit a standard `Transfer` event on successful transfer
      ✔ Should fail and revert if the sender does not have enough balance
      ✔ Should update balances correctly over sequential transfers
    3. Token Approvals & Allowances (`approve` & `allowance`)
      ✔ Should initialize allowance to zero for non-approved spenders
      ✔ Should set and report the correct allowance when approved
      ✔ Should emit an `Approval` event when allowance is set
      ✔ Should allow updating or overwriting an existing allowance
    4. Delegated Transfers (`transferFrom`)
      ✔ Should allow the authorized spender to execute `transferFrom`
      ✔ Should emit both Transfer and Approval events during `transferFrom`
      ✔ Should fail and revert if the spender attempts to transfer more than approved allowance
      ✔ Should fail if the owner balance is insufficient even if allowance is large
      ✔ Should allow exact full allowance usage down to zero

  18 passing
```

---

## 💻 Local Deployment Simulation

Before touching any live blockchain, simulate the deployment on Hardhat's in-memory local blockchain:

```bash
npm run deploy:local
```

**Expected Local Output:**
```text
====================================================
Starting deployment of SimpleToken on [hardhat]...
====================================================

Deployer Address : 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Account Balance  : 10000.0 ETH

Deploying SimpleToken contract...

====================================================
 Contract Deployed Successfully!
====================================================
Network          : hardhat (Chain ID: 31337)
Contract Address : 0x5FbDB2315678afecb367f032d93F642f64180aa3
Token Name       : Simple Token
Token Symbol     : STK
Decimals         : 18
Total Supply     : 1000000.0 STK
Deployer Balance : 1000000.0 STK
====================================================
```

---

## 🌐 Sepolia Testnet Deployment Guide

Deploying to the Ethereum Sepolia testnet requires **Sepolia test ETH** (free testnet currency with no monetary value) and your test account's private key.

### Step 1: Obtain Free Sepolia Test ETH
Get 0.05 - 0.2 Sepolia ETH from any of these faucets:
- [Google Cloud Web3 Sepolia Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) (Quick, reliable)
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com)
- [Chainlink Faucets](https://faucets.chain.link)

### Step 2: Get a Sepolia RPC Provider URL
You can obtain a free endpoint from:
- [Alchemy](https://www.alchemy.com/): Create an app, choose Ethereum -> Sepolia, and copy the HTTPS URL.
- [Infura](https://www.infura.io/): Create an API Key, enable Sepolia.
- Or use a public RPC like: `https://rpc.sepolia.org`

### Step 3: Export Your MetaMask Private Key (Safely)
> [!CAUTION]
> - **NEVER share your 12-word Secret Recovery Phrase!**
> - Create a **new, dedicated test account** inside MetaMask (e.g., named "Dev Testnet").
> - Never store real assets on an account whose private key you export to `.env`.

In MetaMask:
1. Click the account dropdown -> Create Account -> name it `Sepolia Dev`.
2. Click the 3 dots next to the account name -> **Account Details**.
3. Click **Show Private Key** -> Enter your MetaMask password.
4. Copy the 64-character private key.

### Step 4: Configure Your Environment File
1. Copy the example configuration:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your values:
   ```env
   SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY"
   PRIVATE_KEY="your_64_character_hex_private_key"
   ```

### Step 5: Execute Sepolia Deployment
Run the deployment script configured for Sepolia:
```bash
npm run deploy:sepolia
```

When finished, your contract address and a clickable Etherscan link will be displayed in the terminal:
```text
https://sepolia.etherscan.io/address/<YOUR_CONTRACT_ADDRESS>
```

---

## 🦊 MetaMask Configuration

To see your new `STK` tokens in MetaMask:
1. Open MetaMask and switch your network to **Sepolia** (enable "Show test networks" in MetaMask settings if hidden).
2. Go to the **Tokens** tab and scroll to the bottom.
3. Click **Import tokens**.
4. Paste your **Contract Address** output by the deployment script.
5. MetaMask will automatically detect:
   - **Token symbol**: `STK`
   - **Token decimal**: `18`
6. Click **Next** -> **Import**. Your balance will now display `1,000,000 STK`!

---

## 🔒 Security Best Practices

1. **Git Isolation**: The `.gitignore` file strictly excludes `.env` to prevent accidental credential leakage to public repositories.
2. **Dedicated Test Wallet**: Always maintain an isolated wallet for testnets that never holds mainnet funds.
3. **No Hardcoded Credentials**: Neither the contract nor scripts contain hardcoded credentials; all credentials flow through environment variables.
4. **Standard ERC-6093 Custom Errors**: Memory-efficient error representations protect against transaction spam and reduce execution gas costs.

---

## 🎓 IEEE Viva & Interview Preparation

For a complete breakdown of contract internals, EVM storage layout, gas optimization, and standard viva defense questions, read the companion document:
👉 [**PROJECT_REPORT.md**](file:///Users/admin/Documents/antigravity/simple%20erc20%20-%20token/PROJECT_REPORT.md)

---

## 📄 License
This project is open-source and licensed under the [MIT License](https://opensource.org/licenses/MIT).

