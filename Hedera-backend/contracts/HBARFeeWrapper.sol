// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

interface ISaucerSwapRouter {
    function swapExactETHForTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable returns (uint[] memory amounts);
    
    function swapExactTokensForETH(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

/// @title HBARFeeWrapper
/// @notice Wraps ALL DEX interactions to ensure 5% HBAR fee on every trade
/// @dev Users interact with this contract instead of DEXs directly
contract HBARFeeWrapper {
    address public immutable platformWallet;
    
    // Fee configuration
    uint256 public constant SWAP_FEE_PERCENT = 5; // 5% fee on HBAR amount
    uint256 public constant CREATOR_SHARE = 60; // 60% of fees to creator
    uint256 public constant PLATFORM_SHARE = 40; // 40% of fees to platform
    
    // Token creator mapping
    mapping(address => address) public tokenCreators;
    
    // Supported DEX routers
    mapping(address => bool) public supportedRouters;
    
    event FeeCollected(
        address indexed token,
        address indexed trader,
        address indexed dex,
        uint256 hbarAmount,
        uint256 feeAmount,
        uint256 creatorFee,
        uint256 platformFee
    );
    
    constructor(address _platformWallet) {
        platformWallet = _platformWallet;
    }
    
    /// @notice Register a token and its creator
    function registerToken(address token, address creator) external {
        require(msg.sender == platformWallet, "Only platform");
        tokenCreators[token] = creator;
    }
    
    /// @notice Add supported DEX router
    function addSupportedRouter(address router) external {
        require(msg.sender == platformWallet, "Only platform");
        supportedRouters[router] = true;
    }
    
    /// @notice Swap HBAR for tokens via any supported DEX (with fee)
    function swapHBARForTokensOnDEX(
        address router,
        address token,
        uint256 amountOutMin,
        uint256 deadline
    ) external payable {
        require(msg.value > 0, "Must send HBAR");
        require(supportedRouters[router], "Unsupported router");
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
        
        // Execute swap on external DEX
        address[] memory path = new address[](2);
        path[0] = ISaucerSwapRouter(router).WETH(); // Assuming WETH method exists
        path[1] = token;
        
        ISaucerSwapRouter(router).swapExactETHForTokens{value: swapAmount}(
            amountOutMin,
            path,
            msg.sender,
            deadline
        );
        
        emit FeeCollected(
            token,
            msg.sender,
            router,
            msg.value,
            totalFee,
            creatorFee,
            platformFee
        );
    }
    
    /// @notice Swap tokens for HBAR via any supported DEX (with fee in HBAR)
    function swapTokensForHBAROnDEX(
        address router,
        address token,
        uint256 amountIn,
        uint256 amountOutMin,
        uint256 deadline
    ) external payable {
        require(msg.value > 0, "Must send HBAR for fee");
        require(supportedRouters[router], "Unsupported router");
        require(tokenCreators[token] != address(0), "Token not registered");
        
        // Calculate fees from the HBAR sent for fees
        uint256 totalFee = (msg.value * SWAP_FEE_PERCENT) / 100;
        uint256 creatorFee = (totalFee * CREATOR_SHARE) / 100;
        uint256 platformFee = totalFee - creatorFee;
        
        // Transfer fees
        address creator = tokenCreators[token];
        (bool creatorSuccess, ) = creator.call{value: creatorFee}("");
        require(creatorSuccess, "Creator fee transfer failed");
        
        (bool platformSuccess, ) = platformWallet.call{value: platformFee}("");
        require(platformSuccess, "Platform fee transfer failed");
        
        // Transfer tokens from user to this contract
        IERC20(token).transferFrom(msg.sender, address(this), amountIn);
        
        // Approve router to spend tokens
        IERC20(token).approve(router, amountIn);
        
        // Execute swap on external DEX
        address[] memory path = new address[](2);
        path[0] = token;
        path[1] = ISaucerSwapRouter(router).WETH();
        
        ISaucerSwapRouter(router).swapExactTokensForETH(
            amountIn,
            amountOutMin,
            path,
            msg.sender,
            deadline
        );
        
        emit FeeCollected(
            token,
            msg.sender,
            router,
            msg.value,
            totalFee,
            creatorFee,
            platformFee
        );
    }
    
    /// @notice Emergency withdrawal
    function emergencyWithdraw() external {
        require(msg.sender == platformWallet, "Only platform");
        (bool success, ) = platformWallet.call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
} 