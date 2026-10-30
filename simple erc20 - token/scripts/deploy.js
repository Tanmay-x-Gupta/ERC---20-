const { ethers, network } = require("hardhat");

async function main() {
  console.log("====================================================");
  console.log(`Starting deployment of SimpleToken on [${network.name}]...`);
  console.log("====================================================\n");

  // Get the deploying account
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error(
      "No deployer account found! Check your .env file and ensure PRIVATE_KEY is populated."
    );
  }

  const deployerAddress = await deployer.getAddress();
  const balance = await ethers.provider.getBalance(deployerAddress);
  const balanceInEth = ethers.formatEther(balance);

  console.log(`Deployer Address : ${deployerAddress}`);
  console.log(`Account Balance  : ${balanceInEth} ETH`);

  if (network.name === "sepolia" && balance === 0n) {
    console.error("\n[Error] The deployer account has 0 Sepolia ETH.");
    console.error("Please request free testnet ETH from a Sepolia faucet before proceeding.");
    console.error("Faucets:");
    console.error("  - https://cloud.google.com/application/web3/faucet/ethereum/sepolia");
    console.error("  - https://sepoliafaucet.com");
    console.error("  - https://faucets.chain.link");
    process.exit(1);
  }

  console.log("\nDeploying SimpleToken contract...");
  const SimpleTokenFactory = await ethers.getContractFactory("SimpleToken");
  const simpleToken = await SimpleTokenFactory.deploy();

  await simpleToken.waitForDeployment();
  const contractAddress = await simpleToken.getAddress();

  // Query metadata directly from the freshly deployed contract
  const name = await simpleToken.name();
  const symbol = await simpleToken.symbol();
  const decimals = await simpleToken.decimals();
  const totalSupply = await simpleToken.totalSupply();
  const formattedSupply = ethers.formatUnits(totalSupply, decimals);

  console.log("\n====================================================");
  console.log(" Contract Deployed Successfully!");
  console.log("====================================================");
  console.log(`Network          : ${network.name} (Chain ID: ${(await ethers.provider.getNetwork()).chainId})`);
  console.log(`Contract Address : ${contractAddress}`);
  console.log(`Token Name       : ${name}`);
  console.log(`Token Symbol     : ${symbol}`);
  console.log(`Decimals         : ${decimals}`);
  console.log(`Total Supply     : ${formattedSupply} ${symbol}`);
  console.log(`Deployer Balance : ${formattedSupply} ${symbol}`);

  if (network.name === "sepolia") {
    console.log("\nView your contract on Sepolia Etherscan:");
    console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log("\nTo import your token into MetaMask:");
    console.log(`1. Switch MetaMask network to 'Sepolia'.`);
    console.log(`2. Click 'Import tokens'.`);
    console.log(`3. Paste Contract Address: ${contractAddress}`);
    console.log(`4. Token Symbol (${symbol}) and Decimals (${decimals}) will auto-populate.`);
  }

  console.log("====================================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });

