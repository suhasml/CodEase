// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @title CustomSwapAMM
/// @notice Automated Market Maker that ensures ALL HBAR→token swaps have 5% fee
/// @dev This contract holds all liquidity and is the ONLY way to trade tokens
contract CustomSwapAMM {
    address public immutable platformWallet;
    
    // Fee configuration
    uint256 public constant SWAP_FEE_PERCENT = 5; // 5% fee on HBAR amount
    uint256 public constant CREATOR_SHARE = 60; // 60% of fees to creator
    uint256 public constant PLATFORM_SHARE = 40; // 40% of fees to platform
    
    // Token data
    struct TokenPool {
        address tokenAddress;
        address creator;
        uint256 tokenReserve;    // How many tokens in the pool
        uint256 hbarReserve;     // How much HBAR in the pool
        bool initialized;
    }
    
    mapping(address => TokenPool) public pools;
    address[] public allTokens;
    
    event PoolCreated(address indexed token, address indexed creator, uint256 tokenAmount, uint256 hbarAmount);
    event SwapExecuted(
        address indexed token,
        address indexed buyer,
        uint256 hbarIn,
        uint256 feeAmount,
        uint256 creatorFee,
        uint256 platformFee,
        uint256 tokensOut
    );
    
    constructor(address _platformWallet) {
        platformWallet = _platformWallet;
    }
    
    /// @notice Initialize a new token pool (called during token creation)
    function createPool(
        address token,
        address creator,
        uint256 tokenAmount
    ) external payable {
        require(!pools[token].initialized, "Pool already exists");
        require(msg.value > 0, "Must provide initial HBAR liquidity");
        require(tokenAmount > 0, "Must provide tokens");
        
        // Transfer tokens to this contract
        IERC20(token).transferFrom(msg.sender, address(this), tokenAmount);
        
        // Initialize pool
        pools[token] = TokenPool({
            tokenAddress: token,
            creator: creator,
            tokenReserve: tokenAmount,
            hbarReserve: msg.value,
            initialized: true
        });
        
        allTokens.push(token);
        
        emit PoolCreated(token, creator, tokenAmount, msg.value);
    }
    
    /// @notice Swap HBAR for tokens (ONLY way to get tokens)
    function swapHBARForTokens(
        address token,
        uint256 minTokensOut
    ) external payable {
        require(msg.value > 0, "Must send HBAR");
        require(pools[token].initialized, "Pool does not exist");
        
        TokenPool storage pool = pools[token];
        
        // Calculate fees (5% of input HBAR)
        uint256 totalFee = (msg.value * SWAP_FEE_PERCENT) / 100;
        uint256 creatorFee = (totalFee * CREATOR_SHARE) / 100;
        uint256 platformFee = totalFee - creatorFee;
        uint256 hbarForSwap = msg.value - totalFee;
        
        // Calculate tokens out using constant product formula: x * y = k
        // New HBAR reserve = current + hbarForSwap
        // New token reserve = k / new HBAR reserve
        // Tokens out = current token reserve - new token reserve
        uint256 k = pool.tokenReserve * pool.hbarReserve;
        uint256 newHbarReserve = pool.hbarReserve + hbarForSwap;
        uint256 newTokenReserve = k / newHbarReserve;
        uint256 tokensOut = pool.tokenReserve - newTokenReserve;
        
        require(tokensOut >= minTokensOut, "Insufficient output amount");
        require(tokensOut < pool.tokenReserve, "Not enough liquidity");
        
        // Update reserves
        pool.tokenReserve = newTokenReserve;
        pool.hbarReserve = newHbarReserve;
        
        // Transfer fees
        (bool creatorSuccess, ) = pool.creator.call{value: creatorFee}("");
        require(creatorSuccess, "Creator fee transfer failed");
        
        (bool platformSuccess, ) = platformWallet.call{value: platformFee}("");
        require(platformSuccess, "Platform fee transfer failed");
        
        // Transfer tokens to buyer
        IERC20(token).transfer(msg.sender, tokensOut);
        
        emit SwapExecuted(
            token,
            msg.sender,
            msg.value,
            totalFee,
            creatorFee,
            platformFee,
            tokensOut
        );
    }
    
    /// @notice Get expected tokens out for HBAR input (including fees)
    function getTokensOut(address token, uint256 hbarIn) 
        external view returns (uint256 tokensOut, uint256 feeAmount) {
        require(pools[token].initialized, "Pool does not exist");
        
        TokenPool memory pool = pools[token];
        
        feeAmount = (hbarIn * SWAP_FEE_PERCENT) / 100;
        uint256 hbarForSwap = hbarIn - feeAmount;
        
        // Constant product formula
        uint256 k = pool.tokenReserve * pool.hbarReserve;
        uint256 newHbarReserve = pool.hbarReserve + hbarForSwap;
        uint256 newTokenReserve = k / newHbarReserve;
        tokensOut = pool.tokenReserve - newTokenReserve;
    }
    
    /// @notice Get current pool reserves
    function getReserves(address token) external view returns (uint256 tokenReserve, uint256 hbarReserve) {
        TokenPool memory pool = pools[token];
        return (pool.tokenReserve, pool.hbarReserve);
    }
    
    /// @notice Get all tokens with pools
    function getAllTokens() external view returns (address[] memory) {
        return allTokens;
    }
    
    /// @notice Emergency withdrawal (only platform)
    function emergencyWithdraw(address token) external {
        require(msg.sender == platformWallet, "Only platform");
        
        if (token == address(0)) {
            // Withdraw HBAR
            (bool success, ) = platformWallet.call{value: address(this).balance}("");
            require(success, "HBAR withdrawal failed");
        } else {
            // Withdraw tokens
            uint256 balance = IERC20(token).balanceOf(address(this));
            IERC20(token).transfer(platformWallet, balance);
        }
    }
} 