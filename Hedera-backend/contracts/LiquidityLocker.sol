pragma solidity ^0.8.19;

/// @title LiquidityLocker
/// @notice Holds LP tokens permanently. Any attempt to withdraw reverts.
contract LiquidityLocker {
    address public immutable owner;

    constructor() {
        owner = msg.sender;
    }

    /// @dev Any call to withdraw will revert. LP tokens are locked forever.
    function withdraw() external pure {
        revert("Liquidity locked");
    }

    // Fallbacks disallowed to prevent accidental HBAR reception
    receive() external payable {
        revert("HBAR not accepted");
    }
} 