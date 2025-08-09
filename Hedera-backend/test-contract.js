const { ethers } = require('ethers');
require('dotenv').config();

// Contract addresses
const ROUTER_ADDRESS = "0x9bB2F81DFFd24f56630BEe8F1995C4eC6EA97028";
const POOL_MANAGER = "0x8B221A4dd0Cb6F57BAA3BE7436D13ab0846143Be";

// HashIO RPC URL for Hedera testnet
const HASHIO_RPC_URL = "https://testnet.hashio.io/api";

async function testContract() {
    console.log('🧪 Testing HTS Custom AMM Contract...');
    
    try {
        const provider = new ethers.JsonRpcProvider(HASHIO_RPC_URL);
        
        // Test basic contract connectivity
        console.log('\n📍 Step 1: Testing contract connectivity...');
        
        // Test Pool Manager - simple view function
        const poolManagerContract = new ethers.Contract(POOL_MANAGER, [
            "function getAllTokens() external view returns (address[] memory)"
        ], provider);
        
        console.log('🔍 Getting all tokens from PoolManager...');
        const allTokens = await poolManagerContract.getAllTokens();
        console.log('✅ All tokens:', allTokens);
        console.log('✅ Token count:', allTokens.length);
        
        // Test Router - check if it has the correct functions
        const routerContract = new ethers.Contract(ROUTER_ADDRESS, [
            "function poolManager() external view returns (address)",
            "function feeManager() external view returns (address)"
        ], provider);
        
        console.log('\n🔍 Testing Router contract...');
        const poolManagerFromRouter = await routerContract.poolManager();
        const feeManagerFromRouter = await routerContract.feeManager();
        
        console.log('✅ Router Pool Manager:', poolManagerFromRouter);
        console.log('✅ Router Fee Manager:', feeManagerFromRouter);
        
        // Verify addresses match
        console.log('\n🔍 Verifying contract connections...');
        if (poolManagerFromRouter.toLowerCase() === POOL_MANAGER.toLowerCase()) {
            console.log('✅ Pool Manager addresses match!');
        } else {
            console.error('❌ Pool Manager addresses don\'t match!');
            console.error('Expected:', POOL_MANAGER);
            console.error('Got:', poolManagerFromRouter);
        }
        
        console.log('\n🎉 Contract connectivity test completed!');
        
    } catch (error) {
        console.error('❌ Contract test failed:', error.message);
        console.error('Full error:', error);
    }
}

// Test a specific token (the one that failed)
async function testSpecificToken() {
    console.log('\n🔍 Testing specific token: 0x0000000000000000000000000000000000633b56');
    
    try {
        const provider = new ethers.JsonRpcProvider(HASHIO_RPC_URL);
        
        const poolManagerContract = new ethers.Contract(POOL_MANAGER, [
            "function getPoolInfo(address token) external view returns (tuple(address token, address creator, uint256 reserveToken, uint256 reserveHBAR, uint256 startPrice, uint256 slope, uint256 sold, uint256 feeBps, uint256 creatorFeeBps, uint256 creatorFeeAcc, uint256 platformFeeAcc, bool graduated, bool exists))"
        ], provider);
        
        const tokenAddress = "0x0000000000000000000000000000000000633b56";
        console.log('🔍 Checking pool info for token:', tokenAddress);
        
        const poolInfo = await poolManagerContract.getPoolInfo(tokenAddress);
        console.log('📊 Pool info:', {
            token: poolInfo.token,
            creator: poolInfo.creator,
            reserveToken: poolInfo.reserveToken.toString(),
            reserveHBAR: ethers.formatEther(poolInfo.reserveHBAR),
            exists: poolInfo.exists,
            graduated: poolInfo.graduated
        });
        
    } catch (error) {
        console.error('❌ Token test failed:', error.message);
    }
}

// Test if the token is a valid HTS token
async function testTokenValidity() {
    console.log('\n🔍 Testing if token is valid HTS token...');
    
    try {
        const provider = new ethers.JsonRpcProvider(HASHIO_RPC_URL);
        
        // Try to call balanceOf on the token to see if it responds
        const tokenAddress = "0x0000000000000000000000000000000000633b56";
        const testAccount = "0x5010DD2C3f7E05B8b6E2C272A6BD2DC095AFAb2c"; // Platform wallet
        
        console.log('🔍 Testing token contract at:', tokenAddress);
        console.log('🔍 Test account:', testAccount);
        
        // Simple ERC20 interface to test if token responds
        const tokenContract = new ethers.Contract(tokenAddress, [
            "function balanceOf(address account) view returns (uint256)",
            "function totalSupply() view returns (uint256)",
            "function symbol() view returns (string)",
            "function name() view returns (string)"
        ], provider);
        
        try {
            const balance = await tokenContract.balanceOf(testAccount);
            console.log('✅ Token balance for test account:', balance.toString());
        } catch (balanceError) {
            console.log('⚠️ Balance check failed:', balanceError.message);
        }
        
        try {
            const totalSupply = await tokenContract.totalSupply();
            console.log('✅ Token total supply:', totalSupply.toString());
        } catch (supplyError) {
            console.log('⚠️ Total supply check failed:', supplyError.message);
        }
        
        try {
            const symbol = await tokenContract.symbol();
            console.log('✅ Token symbol:', symbol);
        } catch (symbolError) {
            console.log('⚠️ Symbol check failed:', symbolError.message);
        }
        
        try {
            const name = await tokenContract.name();
            console.log('✅ Token name:', name);
        } catch (nameError) {
            console.log('⚠️ Name check failed:', nameError.message);
        }
        
    } catch (error) {
        console.error('❌ Token validity test failed:', error.message);
    }
}

async function main() {
    await testContract();
    await testSpecificToken();
    await testTokenValidity();
}

main().catch(console.error);
