const { ethers } = require('ethers');
require('dotenv').config();

async function deployCustomSwapAMM() {
    console.log('\n🚀 Deploying CustomSwapAMM Contract...');
    console.log('━'.repeat(50));

    // Configuration
    const HASHIO_RPC_URL = process.env.HASHIO_RPC_URL || "https://testnet.hashio.io/api";
    const EVM_PRIVATE_KEY = process.env.OPERATOR_EVM_KEY;
    const PLATFORM_WALLET = process.env.PLATFORM_WALLET_ADDRESS || process.env.OPERATOR_ID;
    
    if (!EVM_PRIVATE_KEY) {
        throw new Error('OPERATOR_EVM_KEY not set in environment');
    }
    
    if (!PLATFORM_WALLET) {
        throw new Error('PLATFORM_WALLET_ADDRESS not set in environment');
    }

    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider(HASHIO_RPC_URL);
    const wallet = new ethers.Wallet(EVM_PRIVATE_KEY, provider);
    
    console.log(`📡 Network: ${HASHIO_RPC_URL}`);
    console.log(`👤 Deployer: ${wallet.address}`);
    console.log(`🏢 Platform Wallet: ${PLATFORM_WALLET}`);

    // Contract ABI
    const contractABI = [
        "constructor(address _platformWallet)",
        "function createPool(address token, address creator, uint256 tokenAmount) external payable",
        "function swapHBARForTokens(address token, uint256 minTokensOut) external payable",
        "function getTokensOut(address token, uint256 hbarIn) external view returns (uint256 tokensOut, uint256 feeAmount)",
        "function getReserves(address token) external view returns (uint256 tokenReserve, uint256 hbarReserve)",
        "function pools(address) external view returns (address tokenAddress, address creator, uint256 tokenReserve, uint256 hbarReserve, bool initialized)",
        "function SWAP_FEE_PERCENT() external view returns (uint256)",
        "function CREATOR_SHARE() external view returns (uint256)",
        "function PLATFORM_SHARE() external view returns (uint256)",
        "event PoolCreated(address indexed token, address indexed creator, uint256 tokenAmount, uint256 hbarAmount)",
        "event SwapExecuted(address indexed token, address indexed buyer, uint256 hbarIn, uint256 feeAmount, uint256 creatorFee, uint256 platformFee, uint256 tokensOut)"
    ];

    // Note: You need to compile the Solidity contract to get bytecode
    const contractBytecode = "0x"; // Placeholder - compile CustomSwapAMM.sol to get actual bytecode
    
    try {
        console.log('\n⏳ Deploying AMM contract...');
        console.log('⚠️  This AMM will be the ONLY way to trade tokens');
        console.log('✅ Guarantees 5% HBAR fee on ALL trades');
        
        // Create contract factory
        const factory = new ethers.ContractFactory(contractABI, contractBytecode, wallet);
        
        const customAMM = await factory.deploy(
            PLATFORM_WALLET,
            {
                gasLimit: 3000000 // Adjust as needed
            }
        );
        
        await customAMM.waitForDeployment();
        const contractAddress = await customAMM.getAddress();
        
        console.log('\n✅ CustomSwapAMM deployed successfully!');
        console.log(`📍 Contract Address: ${contractAddress}`);
        
        // Verify deployment
        console.log('\n🔍 Verifying deployment...');
        const swapFeePercent = await customAMM.SWAP_FEE_PERCENT();
        const creatorShare = await customAMM.CREATOR_SHARE();
        const platformShare = await customAMM.PLATFORM_SHARE();
        
        console.log(`💰 Swap Fee: ${swapFeePercent}%`);
        console.log(`👤 Creator Share: ${creatorShare}% of fees`);
        console.log(`🏢 Platform Share: ${platformShare}% of fees`);
        
        console.log('\n🎯 Key Features:');
        console.log('✅ Holds ALL token liquidity');
        console.log('✅ ONLY way to trade tokens');
        console.log('✅ Guaranteed 5% HBAR fee');
        console.log('✅ Automatic fee distribution');
        console.log('✅ No way for users to avoid fees');
        
        // Update environment variables
        console.log('\n📝 Add this to your .env file:');
        console.log(`CUSTOM_SWAP_AMM=${contractAddress}`);
        
        return {
            address: contractAddress,
            contract: customAMM
        };
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        throw error;
    }
}

// Helper function to get contract bytecode (you'll need to implement this)
async function getCompiledContract() {
    console.log('\n⚠️  IMPORTANT: Compile the contract first!');
    console.log('Run one of these commands:');
    console.log('- npx hardhat compile');
    console.log('- solc --abi --bin contracts/CustomSwapAMM.sol');
    console.log('\nThen update the bytecode in this script.');
    
    // In production, this would read the compiled contract artifacts
    return {
        bytecode: "0x", // Get from compilation
        abi: [] // Get from compilation
    };
}

if (require.main === module) {
    deployCustomSwapAMM()
        .then((result) => {
            console.log('\n🎉 AMM Deployment complete!');
            console.log('📊 Now tokens can ONLY be traded via this AMM');
            console.log('💰 EVERY trade will generate 5% HBAR fees');
            console.log('🚀 Ready to launch meme coins with guaranteed revenue!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Deployment failed:', error);
            process.exit(1);
        });
}

module.exports = { deployCustomSwapAMM }; 