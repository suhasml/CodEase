pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title MemeAmmRouter
/// @notice Production-ready AMM Router for multiple meme tokens with bonding curve pricing
/// @dev Manages unlimited token/HBAR pools with linear bonding curves, fees, and graduation functionality
contract MemeAmmRouter is Ownable(0x5010DD2C3f7E05B8b6E2C272A6BD2DC095AFAb2c), ReentrancyGuard {
    
    struct Pool {
        address token;           // Token contract address
        address creator;         // Pool creator address
        uint256 reserveToken;    // Current token balance in pool
        uint256 reserveHBAR;     // Current HBAR balance in pool
        uint256 startPrice;      // Starting price in wei/tinybar per token
        uint256 slope;           // Linear price increment per token sold
        uint256 sold;            // Total tokens sold so far
        uint256 feeBps;          // Total fee in basis points (e.g., 500 = 5%)
        uint256 creatorFeeBps;   // Creator's share of fees in basis points
        uint256 creatorFeeAcc;   // Accumulated HBAR fees for creator
        uint256 platformFeeAcc;  // Accumulated HBAR fees for platform
        bool graduated;          // Whether pool has graduated to public DEX
        bool exists;             // Whether pool exists (for mapping check)
    }

    mapping(address => Pool) public pools;
    address[] public allTokens;
    address public platformFeeWallet;
    
    // Constants
    uint256 public constant MAX_FEE_BPS = 1000; // Maximum 10% total fee
    uint256 public constant BASIS_POINTS = 10000;
    
    // Events
    event PoolCreated(
        address indexed token, 
        address indexed creator, 
        uint256 tokens, 
        uint256 hbar, 
        uint256 curveSlope, 
        uint256 startPrice, 
        uint256 feeBps
    );
    
    event Swapped(
        address indexed user, 
        address indexed token, 
        uint256 hbarIn, 
        uint256 tokenOut, 
        uint256 fee
    );
    
    event SwappedBack(
        address indexed user, 
        address indexed token, 
        uint256 tokenIn, 
        uint256 hbarOut, 
        uint256 fee
    );
    
    event Graduated(
        address indexed token, 
        uint256 platformShare, 
        uint256 creatorShare, 
        uint256 tokenToCreator
    );
    
    event FeeClaimed(
        address indexed token, 
        address indexed claimer, 
        uint256 amount
    );

    constructor(address _platformFeeWallet) Ownable(msg.sender) {
        platformFeeWallet = _platformFeeWallet;
    }

    // ---- ADMIN FUNCTIONS ----

    /// @notice Update platform fee wallet (only owner)
    function setPlatformWallet(address _wallet) external onlyOwner {
        require(_wallet != address(0), "Invalid wallet");
        platformFeeWallet = _wallet;
    }

    // ---- POOL CREATION ----

    /// @notice Create a new token pool with bonding curve pricing
    /// @param _token Token contract address
    /// @param _creator Pool creator address (receives creator fees)
    /// @param _tokenAmount Initial token amount to deposit
    /// @param _startPrice Starting price per token in wei
    /// @param _slope Price increment per token sold
    /// @param _feeBps Total fee in basis points (max 1000 = 10%)
    /// @param _creatorFeeBps Creator's share of total fee in basis points
    function createPool(
        address _token,
        address _creator,
        uint256 _tokenAmount,
        uint256 _startPrice,
        uint256 _slope,
        uint256 _feeBps,
        uint256 _creatorFeeBps
    ) external payable onlyOwner nonReentrant {
        require(!pools[_token].exists, "Pool already exists");
        require(_token != address(0), "Invalid token address");
        require(_creator != address(0), "Invalid creator address");
        require(_tokenAmount > 0, "Token amount must be > 0");
        require(msg.value > 0, "HBAR amount must be > 0");
        require(_feeBps <= MAX_FEE_BPS, "Fee too high");
        require(_creatorFeeBps <= _feeBps, "Creator fee > total fee");
        
        IERC20 token = IERC20(_token);
        require(token.balanceOf(msg.sender) >= _tokenAmount, "Insufficient token balance");

        // Transfer tokens to this contract
        require(token.transferFrom(msg.sender, address(this), _tokenAmount), "Token transfer failed");
        
        // Create pool
        pools[_token] = Pool({
            token: _token,
            creator: _creator,
            reserveToken: _tokenAmount,
            reserveHBAR: msg.value,
            startPrice: _startPrice,
            slope: _slope,
            sold: 0,
            feeBps: _feeBps,
            creatorFeeBps: _creatorFeeBps,
            creatorFeeAcc: 0,
            platformFeeAcc: 0,
            graduated: false,
            exists: true
        });
        
        allTokens.push(_token);
        
        emit PoolCreated(_token, _creator, _tokenAmount, msg.value, _slope, _startPrice, _feeBps);
    }

    // ---- TRADING FUNCTIONS ----

    /// @notice Calculate cost to buy a specific amount of tokens
    /// @param token Token address
    /// @param amount Number of tokens to buy
    /// @return cost Total HBAR cost including fees
    function getBuyPrice(address token, uint256 amount) public view returns (uint256 cost) {
        Pool storage p = pools[token];
        require(p.exists && !p.graduated, "Pool not available");
        require(amount > 0, "Amount must be > 0");
        require(amount <= p.reserveToken, "Insufficient liquidity");
        
        // Calculate cost using arithmetic progression sum
        // Price = startPrice + slope * sold
        // For n tokens: sum = n * firstPrice + slope * n * (n-1) / 2
        uint256 firstPrice = p.startPrice + p.slope * p.sold;
        cost = amount * firstPrice + p.slope * amount * (amount - 1) / 2;
    }

    /// @notice Swap HBAR for tokens using bonding curve
    /// @param token Token to buy
    /// @param minTokensOut Minimum tokens expected (slippage protection)
    function swapHBARForTokens(address token, uint256 minTokensOut) 
        external payable nonReentrant {
        Pool storage p = pools[token];
        require(p.exists && !p.graduated, "Pool not available");
        require(msg.value > 0, "No HBAR sent");
        require(p.reserveToken > 0, "Pool empty");

        // Binary search to find maximum tokens we can buy with sent HBAR
        uint256 tokensOut = _findMaxTokensForHBAR(token, msg.value);
        require(tokensOut >= minTokensOut, "Insufficient output amount");
        require(tokensOut > 0, "No tokens available");

        uint256 cost = getBuyPrice(token, tokensOut);
        require(cost <= msg.value, "Insufficient HBAR");
        
        uint256 change = msg.value - cost;
        
        // Calculate and distribute fees
        uint256 fee = cost * p.feeBps / BASIS_POINTS;
        uint256 creatorPart = fee * p.creatorFeeBps / p.feeBps;
        p.creatorFeeAcc += creatorPart;
        p.platformFeeAcc += (fee - creatorPart);

        // Update pool state
        p.sold += tokensOut;
        p.reserveToken -= tokensOut;
        p.reserveHBAR += (cost - fee);

        // Transfer tokens to buyer
        require(IERC20(token).transfer(msg.sender, tokensOut), "Token transfer failed");
        
        // Refund excess HBAR
        if (change > 0) {
            (bool success, ) = payable(msg.sender).call{value: change}("");
            require(success, "Refund failed");
        }

        emit Swapped(msg.sender, token, cost, tokensOut, fee);
    }

    /// @notice Calculate HBAR payout for selling tokens
    /// @param token Token address
    /// @param amount Number of tokens to sell
    /// @return payout HBAR amount before fees
    function getSellPayout(address token, uint256 amount) public view returns (uint256 payout) {
        Pool storage p = pools[token];
        require(p.exists && !p.graduated, "Pool not available");
        require(amount > 0, "Amount must be > 0");
        require(amount <= p.sold, "Cannot sell more than sold");
        
        // Calculate payout using reverse arithmetic progression
        // Last price would be: startPrice + slope * (sold - 1)
        // For n tokens from the end: sum = n * lastPrice - slope * n * (n-1) / 2
        uint256 lastPrice = p.startPrice + p.slope * (p.sold - 1);
        payout = amount * lastPrice - p.slope * amount * (amount - 1) / 2;
    }

    /// @notice Swap tokens for HBAR using bonding curve
    /// @param token Token to sell
    /// @param tokenAmountIn Number of tokens to sell
    /// @param minHBAROut Minimum HBAR expected (slippage protection)
    function swapTokensForHBAR(address token, uint256 tokenAmountIn, uint256 minHBAROut) 
        external nonReentrant {
        Pool storage p = pools[token];
        require(p.exists && !p.graduated, "Pool not available");
        require(tokenAmountIn > 0, "No tokens specified");
        require(tokenAmountIn <= p.sold, "Cannot sell more than sold");

        uint256 outHBAR = getSellPayout(token, tokenAmountIn);
        require(p.reserveHBAR >= outHBAR, "Insufficient HBAR liquidity");
        
        // Calculate fees
        uint256 fee = outHBAR * p.feeBps / BASIS_POINTS;
        uint256 creatorPart = fee * p.creatorFeeBps / p.feeBps;
        p.creatorFeeAcc += creatorPart;
        p.platformFeeAcc += (fee - creatorPart);

        uint256 finalPayout = outHBAR - fee;
        require(finalPayout >= minHBAROut, "Slippage too high");

        // Update pool state
        p.sold -= tokenAmountIn;
        p.reserveToken += tokenAmountIn;
        p.reserveHBAR -= outHBAR;

        // Transfer tokens from seller
        require(IERC20(token).transferFrom(msg.sender, address(this), tokenAmountIn), 
                "Token transfer failed");
        
        // Send HBAR to seller
        (bool success, ) = payable(msg.sender).call{value: finalPayout}("");
        require(success, "HBAR transfer failed");

        emit SwappedBack(msg.sender, token, tokenAmountIn, finalPayout, fee);
    }

    // ---- GRADUATION FUNCTIONS ----

    /// @notice Graduate pool to public DEX (only owner)
    /// @param token Token to graduate
    function graduatePool(address token) external onlyOwner nonReentrant {
        Pool storage p = pools[token];
        require(p.exists && !p.graduated, "Pool not available for graduation");
        
        p.graduated = true;
        
        // Distribute remaining reserves
        uint256 hbarShare = p.reserveHBAR;
        uint256 tokenShare = p.reserveToken;
        
        if (hbarShare > 0) {
            // Add graduation fee to accumulated fees
            uint256 totalFee = hbarShare * p.feeBps / BASIS_POINTS;
            uint256 creatorPart = totalFee * p.creatorFeeBps / p.feeBps;
            p.creatorFeeAcc += creatorPart;
            p.platformFeeAcc += (totalFee - creatorPart);
        }
        
        // Send tokens to creator
        if (tokenShare > 0) {
            require(IERC20(token).transfer(p.creator, tokenShare), "Token transfer to creator failed");
        }
        
        // Auto-claim fees for both parties
        _claimCreatorFees(token);
        _claimPlatformFees(token);
        
        emit Graduated(token, p.platformFeeAcc, p.creatorFeeAcc, tokenShare);
    }

    // ---- FEE CLAIMING ----

    /// @notice Claim accumulated fees for creator
    /// @param token Token address
    function claimCreatorFees(address token) external {
        Pool storage p = pools[token];
        require(msg.sender == p.creator, "Only creator can claim");
        _claimCreatorFees(token);
    }

    /// @notice Claim accumulated fees for platform
    /// @param token Token address
    function claimPlatformFees(address token) external {
        require(msg.sender == platformFeeWallet, "Only platform wallet can claim");
        _claimPlatformFees(token);
    }

    /// @notice Internal function to claim creator fees
    function _claimCreatorFees(address token) internal {
        Pool storage p = pools[token];
        if (p.creatorFeeAcc > 0) {
            uint256 amount = p.creatorFeeAcc;
            p.creatorFeeAcc = 0;
            (bool success, ) = payable(p.creator).call{value: amount}("");
            require(success, "Creator fee transfer failed");
            emit FeeClaimed(token, p.creator, amount);
        }
    }

    /// @notice Internal function to claim platform fees
    function _claimPlatformFees(address token) internal {
        Pool storage p = pools[token];
        if (p.platformFeeAcc > 0) {
            uint256 amount = p.platformFeeAcc;
            p.platformFeeAcc = 0;
            (bool success, ) = payable(platformFeeWallet).call{value: amount}("");
            require(success, "Platform fee transfer failed");
            emit FeeClaimed(token, platformFeeWallet, amount);
        }
    }

    // ---- VIEW FUNCTIONS ----

    /// @notice Get pool reserves
    /// @param token Token address
    /// @return tokenReserve Current token balance
    /// @return hbarReserve Current HBAR balance
    function getPoolReserves(address token) public view returns(uint256 tokenReserve, uint256 hbarReserve) {
        Pool storage p = pools[token];
        return (p.reserveToken, p.reserveHBAR);
    }

    /// @notice Check if pool is graduated
    /// @param token Token address
    /// @return Whether pool is graduated
    function isGraduated(address token) public view returns(bool) {
        return pools[token].graduated;
    }

    /// @notice Get all token addresses with pools
    /// @return Array of token addresses
    function getAllTokens() external view returns(address[] memory) {
        return allTokens;
    }

    /// @notice Get pool information
    /// @param token Token address
    /// @return Pool struct data
    function getPoolInfo(address token) external view returns(Pool memory) {
        return pools[token];
    }

    // ---- INTERNAL HELPER FUNCTIONS ----

    /// @notice Binary search to find maximum tokens buyable with given HBAR
    /// @param token Token address  
    /// @param hbarAmount Available HBAR amount
    /// @return Maximum tokens that can be bought
    function _findMaxTokensForHBAR(address token, uint256 hbarAmount) internal view returns (uint256) {
        Pool storage p = pools[token];
        if (p.reserveToken == 0) return 0;
        
        uint256 left = 0;
        uint256 right = p.reserveToken;
        uint256 result = 0;
        
        while (left <= right) {
            uint256 mid = (left + right) / 2;
            uint256 cost = getBuyPrice(token, mid);
            
            if (cost <= hbarAmount) {
                result = mid;
                left = mid + 1;
            } else {
                if (mid == 0) break;
                right = mid - 1;
            }
        }
        
        return result;
    }

    // ---- EMERGENCY FUNCTIONS ----

    /// @notice Emergency withdrawal (only owner)
    /// @param token Token to withdraw (address(0) for HBAR)
    function emergencyWithdraw(address token) external onlyOwner {
        if (token == address(0)) {
            // Withdraw HBAR
            uint256 balance = address(this).balance;
            (bool success, ) = payable(platformFeeWallet).call{value: balance}("");
            require(success, "HBAR withdrawal failed");
        } else {
            // Withdraw tokens
            uint256 balance = IERC20(token).balanceOf(address(this));
            require(IERC20(token).transfer(platformFeeWallet, balance), "Token withdrawal failed");
        }
    }

    /// @notice Receive HBAR directly
    receive() external payable {}
}