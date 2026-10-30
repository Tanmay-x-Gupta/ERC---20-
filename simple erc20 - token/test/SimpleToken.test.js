const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleToken (STK) ERC-20 Contract", function () {
  let simpleToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  // 1,000,000 tokens scaled by 18 decimal places (10^18)
  const TOTAL_SUPPLY = ethers.parseEther("1000000");

  beforeEach(async function () {
    // Retrieve test accounts provided by the Hardhat network
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy a fresh contract instance before every single test
    const SimpleTokenFactory = await ethers.getContractFactory("SimpleToken");
    simpleToken = await SimpleTokenFactory.deploy();
    await simpleToken.waitForDeployment();
  });

  describe("1. Deployment & Metadata Verification", function () {
    it("Should configure the correct token name", async function () {
      expect(await simpleToken.name()).to.equal("Simple Token");
    });

    it("Should configure the correct token symbol", async function () {
      expect(await simpleToken.symbol()).to.equal("STK");
    });

    it("Should configure standard 18 decimal places", async function () {
      expect(await simpleToken.decimals()).to.equal(18);
    });

    it("Should mint exactly 1,000,000 tokens as the total supply", async function () {
      expect(await simpleToken.totalSupply()).to.equal(TOTAL_SUPPLY);
    });

    it("Should assign the entire initial supply to the deploying account", async function () {
      const ownerBalance = await simpleToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(TOTAL_SUPPLY);
    });
  });

  describe("2. Balance Checking & Direct Token Transfers (`transfer`)", function () {
    it("Should transfer tokens between accounts and update balances correctly", async function () {
      const transferAmount = ethers.parseEther("500");

      // Transfer 500 STK from owner to addr1
      await simpleToken.transfer(addr1.address, transferAmount);

      const addr1Balance = await simpleToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(transferAmount);

      const ownerBalance = await simpleToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(TOTAL_SUPPLY - transferAmount);
    });

    it("Should emit a standard `Transfer` event on successful transfer", async function () {
      const transferAmount = ethers.parseEther("250");

      await expect(simpleToken.transfer(addr1.address, transferAmount))
        .to.emit(simpleToken, "Transfer")
        .withArgs(owner.address, addr1.address, transferAmount);
    });

    it("Should fail and revert if the sender does not have enough balance", async function () {
      const initialAddr1Balance = await simpleToken.balanceOf(addr1.address);
      expect(initialAddr1Balance).to.equal(0n);

      // addr1 has 0 tokens, attempting to transfer 1 token must revert
      await expect(
        simpleToken.connect(addr1).transfer(addr2.address, ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(simpleToken, "ERC20InsufficientBalance");
    });

    it("Should update balances correctly over sequential transfers", async function () {
      // Step 1: Owner transfers 100 STK to addr1
      await simpleToken.transfer(addr1.address, ethers.parseEther("100"));

      // Step 2: addr1 transfers 40 STK to addr2
      await simpleToken.connect(addr1).transfer(addr2.address, ethers.parseEther("40"));

      expect(await simpleToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("60"));
      expect(await simpleToken.balanceOf(addr2.address)).to.equal(ethers.parseEther("40"));
    });
  });

  describe("3. Token Approvals & Allowances (`approve` & `allowance`)", function () {
    it("Should initialize allowance to zero for non-approved spenders", async function () {
      const initialAllowance = await simpleToken.allowance(owner.address, addr1.address);
      expect(initialAllowance).to.equal(0n);
    });

    it("Should set and report the correct allowance when approved", async function () {
      const allowanceAmount = ethers.parseEther("1000");

      await simpleToken.approve(addr1.address, allowanceAmount);
      const allowance = await simpleToken.allowance(owner.address, addr1.address);

      expect(allowance).to.equal(allowanceAmount);
    });

    it("Should emit an `Approval` event when allowance is set", async function () {
      const allowanceAmount = ethers.parseEther("750");

      await expect(simpleToken.approve(addr1.address, allowanceAmount))
        .to.emit(simpleToken, "Approval")
        .withArgs(owner.address, addr1.address, allowanceAmount);
    });

    it("Should allow updating or overwriting an existing allowance", async function () {
      await simpleToken.approve(addr1.address, ethers.parseEther("100"));
      expect(await simpleToken.allowance(owner.address, addr1.address)).to.equal(ethers.parseEther("100"));

      // Overwrite allowance to 250 STK
      await simpleToken.approve(addr1.address, ethers.parseEther("250"));
      expect(await simpleToken.allowance(owner.address, addr1.address)).to.equal(ethers.parseEther("250"));
    });
  });

  describe("4. Delegated Transfers (`transferFrom`)", function () {
    const approvedAmount = ethers.parseEther("1000");
    const transferAmount = ethers.parseEther("400");

    beforeEach(async function () {
      // Owner authorizes addr1 to spend up to 1,000 STK
      await simpleToken.approve(addr1.address, approvedAmount);
    });

    it("Should allow the authorized spender to execute `transferFrom`", async function () {
      // addr1 transfers 400 STK from owner to addr2
      await simpleToken.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount);

      // Verify recipient received tokens
      expect(await simpleToken.balanceOf(addr2.address)).to.equal(transferAmount);

      // Verify owner balance decreased
      expect(await simpleToken.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY - transferAmount);

      // Verify remaining allowance decreased (1000 - 400 = 600 STK)
      expect(await simpleToken.allowance(owner.address, addr1.address)).to.equal(
        approvedAmount - transferAmount
      );
    });

    it("Should emit both Transfer and Approval events during `transferFrom`", async function () {
      await expect(
        simpleToken.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount)
      )
        .to.emit(simpleToken, "Transfer")
        .withArgs(owner.address, addr2.address, transferAmount);
    });

    it("Should fail and revert if the spender attempts to transfer more than approved allowance", async function () {
      const excessAmount = ethers.parseEther("1001");

      await expect(
        simpleToken.connect(addr1).transferFrom(owner.address, addr2.address, excessAmount)
      ).to.be.revertedWithCustomError(simpleToken, "ERC20InsufficientAllowance");
    });

    it("Should fail if the owner balance is insufficient even if allowance is large", async function () {
      // addr2 authorizes addr1 to spend 500 STK, but addr2 has 0 balance
      await simpleToken.connect(addr2).approve(addr1.address, ethers.parseEther("500"));

      await expect(
        simpleToken.connect(addr1).transferFrom(addr2.address, owner.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(simpleToken, "ERC20InsufficientBalance");
    });

    it("Should allow exact full allowance usage down to zero", async function () {
      // Spend entire 1000 STK allowance
      await simpleToken.connect(addr1).transferFrom(owner.address, addr2.address, approvedAmount);

      expect(await simpleToken.allowance(owner.address, addr1.address)).to.equal(0n);
      expect(await simpleToken.balanceOf(addr2.address)).to.equal(approvedAmount);

      // Subsequent attempt should fail because allowance is exhausted
      await expect(
        simpleToken.connect(addr1).transferFrom(owner.address, addr2.address, 1n)
      ).to.be.revertedWithCustomError(simpleToken, "ERC20InsufficientAllowance");
    });
  });
});

