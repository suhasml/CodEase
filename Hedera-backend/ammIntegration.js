const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// AMM Router Integration for Meme Coin Endpoint
class AmmIntegration {
    constructor() {
        // Deployed contract addresses - Updated with newly deployed contracts
        this.AMM_ROUTER_ADDRESS = '0x448A9300B266B539D7F146c8217D43C1eE946BCA'; // MemeAmmRouter
        this.RPC_URL = process.env.HEDERA_TESTNET_RPC_URL || 'https://testnet.hashio.io/api';
        this.PRIVATE_KEY = process.env.PRIVATE_KEY;
        
        // Load AMM ABI
        const deploymentPath = path.join(__dirname, 'deployments/MemeAmmRouter.json');
        const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
        this.AMM_ABI = deployment.abi;
        
        // Setup provider and wallet
        this.provider = new ethers.JsonRpcProvider(this.RPC_URL);
        this.wallet = new ethers.Wallet(this.PRIVATE_KEY, this.provider);
        this.ammContract = new ethers.Contract(this.AMM_ROUTER_ADDRESS, this.AMM_ABI, this.wallet);
        
        console.log(`🤖 AMM Router initialized: ${this.AMM_ROUTER_ADDRESS}`);
    }

    /**
     * Create AMM pool instead of using SaucerSwap
     * @param {string} tokenAddress - EVM address of the token
     * @param {BigInt} amountTokens - Amount of tokens for liquidity
     * @param {number} decimals - Token decimals
     * @param {string} creatorWallet - Creator's wallet address
     * @returns {Promise<Object>} Pool creation result
     */
    async createAmmPool(tokenAddress, amountTokens, decimals, creatorWallet) {
        console.log('\n🏊 Creating AMM Pool...');
        console.log(`🪙 Token: ${tokenAddress}`);
        console.log(`💰 Tokens: ${amountTokens.toString()}`);
        console.log(`👤 Creator: ${creatorWallet}`);
        
        try {
            // Pool parameters for bonding curve
            const hbarAmount = ethers.parseEther('10'); // 10 HBAR initial liquidity (testnet)
            const startPrice = ethers.parseEther('0.0001'); // 0.0001 HBAR per token
            const slope = ethers.parseEther('0.000001'); // 0.000001 HBAR increment per token
            const feeBps = 500; // 5% total fee (matches your existing fee)
            const creatorFeeBps = 300; // 3% for creator (60% of total fee)
            
            console.log(`\n📊 Pool Configuration:`);
            console.log(`   🌊 HBAR Liquidity: ${ethers.formatEther(hbarAmount)} HBAR`);
            console.log(`   💵 Start Price: ${ethers.formatEther(startPrice)} HBAR per token`);
            console.log(`   📈 Price Slope: ${ethers.formatEther(slope)} HBAR increment`);
            console.log(`   💸 Total Fee: ${feeBps / 100}%`);
            console.log(`   👑 Creator Fee: ${creatorFeeBps / 100}% (${(creatorFeeBps/feeBps*100).toFixed(0)}% of total)`);
            
            // First approve tokens for the AMM Router
            console.log('\n🔓 Step 1: Approving tokens for AMM Router...');
            const tokenContract = new ethers.Contract(tokenAddress, [
                "function approve(address spender, uint256 amount) returns (bool)",
                "function allowance(address owner, address spender) view returns (uint256)"
            ], this.wallet);
            
            const approveTx = await tokenContract.approve(this.AMM_ROUTER_ADDRESS, amountTokens);
            const approveReceipt = await approveTx.wait();
            console.log(`✅ Tokens approved: ${approveReceipt.hash}`);
            
            // Create the pool
            console.log('\n🏗️  Step 2: Creating AMM Pool...');
            const createPoolTx = await this.ammContract.createPool(
                tokenAddress,
                creatorWallet,
                amountTokens,
                startPrice,
                slope,
                feeBps,
                creatorFeeBps,
                { value: hbarAmount }
            );
            
            const receipt = await createPoolTx.wait();
            console.log(`✅ AMM Pool created successfully!`);
            console.log(`📤 Transaction: ${receipt.hash}`);
            console.log(`🔗 Explorer: https://hashscan.io/testnet/transaction/${receipt.hash}`);
            
            // Get pool info
            const poolInfo = await this.ammContract.getPoolInfo(tokenAddress);
            
            return {
                success: true,
                method: 'amm_router',
                poolAddress: this.AMM_ROUTER_ADDRESS,
                transactionHash: receipt.hash,
                explorerUrl: `https://hashscan.io/testnet/transaction/${receipt.hash}`,
                poolInfo: {
                    tokenReserve: poolInfo.reserveToken.toString(),
                    hbarReserve: poolInfo.reserveHBAR.toString(),
                    startPrice: poolInfo.startPrice.toString(),
                    slope: poolInfo.slope.toString(),
                    feeBps: poolInfo.feeBps.toString(),
                    creator: poolInfo.creator
                },
                tradingUrl: `https://your-meme-platform.com/trade/${tokenAddress}`,
                message: 'AMM Pool created with bonding curve pricing!'
            };
            
        } catch (error) {
            console.error(`❌ AMM Pool creation failed:`, error.message);
            
            // Provide fallback instructions
            return {
                success: false,
                method: 'amm_router_failed',
                error: error.message,
                fallback: {
                    manual_pool_creation: {
                        why: "Automated AMM pool creation failed, but you can create manually",
                        steps: [
                            "1. Go to your platform's admin interface",
                            "2. Use the createPool function manually", 
                            "3. Set bonding curve parameters",
                            "4. Fund with initial liquidity"
                        ]
                    }
                }
            };
        }
    }

    /**
     * Get pool information for a token
     * @param {string} tokenAddress - EVM address of the token
     * @returns {Promise<Object>} Pool information
     */
    async getPoolInfo(tokenAddress) {
        try {
            const poolInfo = await this.ammContract.getPoolInfo(tokenAddress);
            
            return {
                exists: poolInfo.exists,
                tokenReserve: poolInfo.reserveToken.toString(),
                hbarReserve: poolInfo.reserveHBAR.toString(),
                startPrice: poolInfo.startPrice.toString(),
                slope: poolInfo.slope.toString(),
                sold: poolInfo.sold.toString(),
                feeBps: poolInfo.feeBps.toString(),
                graduated: poolInfo.graduated,
                creator: poolInfo.creator
            };
        } catch (error) {
            console.error('Error getting pool info:', error.message);
            return { exists: false, error: error.message };
        }
    }

    /**
     * Get current buy price for a token amount
     * @param {string} tokenAddress - EVM address of the token
     * @param {string} amount - Amount of tokens to buy
     * @returns {Promise<string>} Price in HBAR
     */
    async getBuyPrice(tokenAddress, amount) {
        try {
            const price = await this.ammContract.getBuyPrice(tokenAddress, amount);
            return price.toString();
        } catch (error) {
            console.error('Error getting buy price:', error.message);
            return '0';
        }
    }

    /**
     * Graduate a pool to public DEX
     * @param {string} tokenAddress - EVM address of the token
     * @returns {Promise<Object>} Graduation result
     */
    async graduatePool(tokenAddress) {
        try {
            const graduateTx = await this.ammContract.graduatePool(tokenAddress);
            const receipt = await graduateTx.wait();
            
            return {
                success: true,
                transactionHash: receipt.hash,
                message: 'Pool graduated to public DEX!'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = AmmIntegration;