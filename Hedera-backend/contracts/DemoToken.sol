// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title DemoToken
/// @notice Simple ERC20 token for testing the MemeAmmRouter
/// @dev Basic mintable token with owner controls
contract DemoToken is ERC20, Ownable {
    
    uint8 private _decimals;
    
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 initialSupply,
        address owner
    ) ERC20(name, symbol) Ownable(owner) {
        _decimals = decimals_;
        _mint(owner, initialSupply * 10**decimals_);
    }

    /// @notice Override decimals function
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /// @notice Mint new tokens (only owner)
    /// @param to Address to mint tokens to
    /// @param amount Amount of tokens to mint (in base units)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Burn tokens from owner's balance
    /// @param amount Amount of tokens to burn (in base units)
    function burn(uint256 amount) external onlyOwner {
        _burn(msg.sender, amount);
    }
}