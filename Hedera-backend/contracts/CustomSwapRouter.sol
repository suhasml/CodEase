// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface ISaucerSwapRouter {
    function swapExactETHForTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable returns (uint[] memory amounts);
    
    function getAmountsOut(uint amountIn, address[] calldata path)
        external view returns (uint[] memory amounts);
    
    function WETH() external pure returns (address);
}

/// @title CustomSwapRouter
/// @notice Handles HBAR→token swaps with 5% fee distribution
contract CustomSwapRouter {
    ISaucerSwapRouter public immutable saucerRouter;
    address public immutable weth;
    address public immutable platformWallet;
    
    // Fee configuration
    uint256 public constant SWAP_FEE_PERCENT = 5; // 5% fee on HBAR amount
    uint256 public constant CREATOR_SHARE = 60; // 60% of fees to creator
    uint256 public constant PLATFORM_SHARE = 40; // 40% of fees to platform
    
    // Token creator mapping
    mapping(address => address) public tokenCreators;
    
    event SwapWithFee(
        address indexed token,
        address indexed buyer,
        uint256 hbarAmount,
        uint256 feeAmount,
        uint256 creatorFee,
        uint256 platformFee,
        uint256 tokensReceived
    );
    
    event TokenCreatorSet(address indexed token, address indexed creator);
    
    constructor(address _saucerRouter, address _platformWallet) {
        saucerRouter = ISaucerSwapRouter(_saucerRouter);
        weth = saucerRouter.WETH();
        platformWallet = _platformWallet;
    }
    
    /// @notice Set the creator for a token (only callable by platform)
    function setTokenCreator(address token, address creator) external {
        require(msg.sender == platformWallet, "Only platform can set creators");
        tokenCreators[token] = creator;
        emit TokenCreatorSet(token, creator);
    }
    
    /// @notice Swap HBAR for tokens with 5% fee
    function swapHBARForTokens(
        address token,
        uint256 amountOutMin,
        uint256 deadline
    ) external payable {
        require(msg.value > 0, "Must send HBAR");
        require(tokenCreators[token] != address(0), "Token not registered");
        
        // Calculate fees
        uint256 totalFee = (msg.value * SWAP_FEE_PERCENT) / 100;
        uint256 creatorFee = (totalFee * CREATOR_SHARE) / 100;
        uint256 platformFee = totalFee - creatorFee;
        uint256 swapAmount = msg.value - totalFee;
        
        // Transfer fees
        address creator = tokenCreators[token];
        (bool creatorSuccess, ) = creator.call{value: creatorFee}("");
        require(creatorSuccess, "Creator fee transfer failed");
        
        (bool platformSuccess, ) = platformWallet.call{value: platformFee}("");
        require(platformSuccess, "Platform fee transfer failed");
        
        // Execute swap with remaining HBAR
        address[] memory path = new address[](2);
        path[0] = weth;
        path[1] = token;
        
        uint[] memory amounts = saucerRouter.swapExactETHForTokens{value: swapAmount}(
            amountOutMin,
            path,
            msg.sender,
            deadline
        );
        
        emit SwapWithFee(
            token,
            msg.sender,
            msg.value,
            totalFee,
            creatorFee,
            platformFee,
            amounts[1]
        );
    }
    
    /// @notice Get expected token amount for HBAR input (after fees)
    function getAmountOut(address token, uint256 hbarAmountIn) 
        external view returns (uint256 tokenAmountOut, uint256 feeAmount) {
        feeAmount = (hbarAmountIn * SWAP_FEE_PERCENT) / 100;
        uint256 swapAmount = hbarAmountIn - feeAmount;
        
        address[] memory path = new address[](2);
        path[0] = weth;
        path[1] = token;
        
        uint[] memory amounts = saucerRouter.getAmountsOut(swapAmount, path);
        tokenAmountOut = amounts[1];
    }
    
    /// @notice Emergency withdrawal (only platform)
    function emergencyWithdraw() external {
        require(msg.sender == platformWallet, "Only platform");
        (bool success, ) = platformWallet.call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
} 