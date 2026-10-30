// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title SimpleToken
 * @dev Standard ERC-20 token smart contract utilizing OpenZeppelin's audited implementation.
 * Prepared for IEEE Blockchain application and interview demonstration.
 *
 * Characteristics:
 * - Name: Simple Token
 * - Symbol: STK
 * - Decimals: 18 (Ethereum standard)
 * - Initial Supply: 1,000,000 STK minted directly to the deployer (msg.sender)
 *
 * Functionality provided out-of-the-box via OpenZeppelin ERC20:
 * - balanceOf(account): Check token holdings of any address
 * - transfer(to, amount): Transfer tokens directly from caller to recipient
 * - approve(spender, amount): Authorize a third-party address (e.g., DEX or smart contract)
 * - allowance(owner, spender): Check remaining approved allowance
 * - transferFrom(from, to, amount): Transfer tokens on behalf of another account using allowance
 */
contract SimpleToken is ERC20 {
    /**
     * @notice Initializes the token metadata and mints initial token supply.
     * @dev Calls OpenZeppelin's ERC20 constructor with "Simple Token" and "STK".
     * Mints 1,000,000 tokens (scaled by 10^18 decimals) to the deploying account.
     */
    constructor() ERC20("Simple Token", "STK") {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }
}

