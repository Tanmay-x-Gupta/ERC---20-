const fs = require("fs");
const path = require("path");
const { ethers, network } = require("hardhat");

async function main() {
  console.log("\n====================================================");
  console.log(" Sepolia Pre-Deployment Safety & Balance Check");
  console.log("====================================================\n");

  // 1. Verify .env exists
  const envPath = path.join(__dirname, "..", ".env");
  const envExists = fs.existsSync(envPath);
  console.log(`1. [.env] File Existence: ${envExists ? "EXISTS (OK)" : "MISSING (FAIL)"}`);
  if (!envExists) {
    console.error("   Error: .env file not found.");
    process.exit(1);
  }

  // 2. Verify .env is listed in .gitignore
  const gitignorePath = path.join(__dirname, "..", ".gitignore");
  let gitignoreProtected = false;
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
    const lines = gitignoreContent.split("\n").map((l) => l.trim());
    gitignoreProtected = lines.includes(".env");
  }
  console.log(`2. [.gitignore] Protection: ${gitignoreProtected ? "PROTECTED (OK - .env is ignored)" : "WARNING (.env not in .gitignore)"}`);

  // 3. Verify hardhat.config.js configuration
  const hardhatConfig = require("../hardhat.config.js");
  const sepoliaConfig = hardhatConfig.networks && hardhatConfig.networks.sepolia;
  const configuredChainId = sepoliaConfig ? sepoliaConfig.chainId : null;
  console.log(`3. [hardhat.config.js] Configured Chain ID: ${configuredChainId} ${configuredChainId === 11155111 ? "(OK - Sepolia)" : "(FAIL)"}`);

  // 4. Verify RPC URL and Private Key (WITHOUT exposing secrets)
  const rpcUrl = process.env.SEPOLIA_RPC_URL || "";
  let maskedRpc = "NOT SET";
  if (rpcUrl) {
    try {
      const parsed = new URL(rpcUrl);
      maskedRpc = `${parsed.protocol}//${parsed.hostname}/v2/${"*".repeat(8)}`;
    } catch {
      maskedRpc = "Custom URL (Format valid)";
    }
  }
  console.log(`4. [RPC URL] Status: ${rpcUrl ? `CONFIGURED (${maskedRpc})` : "MISSING"}`);

  const rawKey = process.env.PRIVATE_KEY || "";
  const keyLength = rawKey.startsWith("0x") ? rawKey.length - 2 : rawKey.length;
  const keyValid = keyLength === 64;
  console.log(`5. [Private Key] Status: ${keyValid ? "CONFIGURED (64 hex characters, secret hidden)" : "INVALID LENGTH"}`);

  if (!keyValid || !rpcUrl) {
    console.error("   Error: Check your .env configuration.");
    process.exit(1);
  }

  // 5. Query public address and Sepolia ETH balance via ethers
  const [signer] = await ethers.getSigners();
  if (!signer) {
    console.error("   Error: Could not load signer from private key.");
    process.exit(1);
  }

  const publicAddress = await signer.getAddress();
  console.log(`6. [Public Wallet Address]: ${publicAddress}`);

  console.log("\nConnecting to Sepolia network via Alchemy RPC...");
  const balanceWei = await ethers.provider.getBalance(publicAddress);
  const balanceEth = ethers.formatEther(balanceWei);
  const liveNetwork = await ethers.provider.getNetwork();

  console.log(`   Live Connected Chain ID : ${liveNetwork.chainId}`);
  console.log(`   Sepolia ETH Balance     : ${balanceEth} ETH`);

  console.log("\n====================================================");
  if (balanceWei > 0n) {
    console.log(" RESULT: Ready for deployment! You have test ETH for gas.");
  } else {
    console.log(" RESULT: Wallet connected, but balance is 0 Sepolia ETH.");
    console.log("         Please claim free test ETH from a faucet before deploying.");
  }
  console.log(" No transactions were sent. No secrets were displayed.");
  console.log("====================================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\nConnection Check Failed:", err.message);
    process.exit(1);
  });

