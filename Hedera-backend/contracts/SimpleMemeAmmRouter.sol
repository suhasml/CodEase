
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MemeAmmRouter {
    address public owner;
    address public platformFeeWallet;
    
    constructor(address _platformFeeWallet) {
        owner = msg.sender;
        platformFeeWallet = _platformFeeWallet;
    }
    
    function setPlatformWallet(address _wallet) external {
        require(msg.sender == owner, "Only owner");
        require(_wallet != address(0), "Invalid wallet");
        platformFeeWallet = _wallet;
    }
}