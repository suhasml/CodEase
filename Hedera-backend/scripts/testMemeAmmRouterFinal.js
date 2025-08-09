const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
    console.log('🧪 Testing MemeAmmRouter contract on Hedera Testnet...\n');

    try {
        // Load deployment info
        const deploymentPath = path.join(__dirname, '../deployments/MemeAmmRouter_Final.json');
        
        if (!fs.existsSync(deploymentPath)) {
            console.error('❌ Deployment file not found. Please deploy the contract first using npm run deploy-amm-final');
            process.exit(1);
        }
        
        const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
        const contractAddress = deploymentInfo.contractAddress;
        const abi = deploymentInfo.abi;
        
        console.log(`📍 Contract address: ${contractAddress}`);
        
        // Setup provider and wallet
        const provider = new ethers.JsonRpcProvider(process.env.HEDERA_TESTNET_RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        console.log(`🔑 Connected with wallet: ${wallet.address}`);
        
        // Connect to the contract
        console.log('🔌 Connecting to contract...');
        const contract = new ethers.Contract(contractAddress, abi, wallet);
        
        // Test basic functions
        console.log('\n🧪 Testing basic contract functions...');
        
        try {
            console.log('📡 Calling owner() function...');
            const owner = await contract.owner();
            console.log(`✅ Owner: ${owner}`);
            
            console.log('📡 Calling platformFeeWallet() function...');
            const platformFeeWallet = await contract.platformFeeWallet();
            console.log(`✅ Platform Fee Wallet: ${platformFeeWallet}`);
            
            console.log('📡 Calling MAX_FEE_BPS() function...');
            const maxFeeBps = await contract.MAX_FEE_BPS();
            console.log(`✅ Max Fee BPS: ${maxFeeBps}`);
            
            console.log('\n✅ Contract is functioning correctly!');
            
            // Add more tests as needed
            
        } catch (error) {
            console.error('❌ Contract function call failed:', error.message);
            console.log('\n⚠️ HEDERA NOTICE: Hedera contract functions might take a few minutes to become available after deployment.');
            console.log('Please wait 2-5 minutes and try again, or check the contract on HashScan.');
        }
        
    } catch (error) {
        console.error('\n❌ Test failed:');
        console.error(error.message);
        process.exit(1);
    }
}

main().catch(console.error);
