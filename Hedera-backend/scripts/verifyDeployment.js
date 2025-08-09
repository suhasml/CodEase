const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function verifyDeployment() {
    console.log('🔍 Verifying MemeAmmRouter Deployment...\n');

    try {
        // Setup provider
        const provider = new ethers.JsonRpcProvider(process.env.HEDERA_TESTNET_RPC_URL);
        
        // Load deployment info
        const deploymentPath = path.join(__dirname, '../deployments/MemeAmmRouter.json');
        const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
        
        console.log('📋 Deployment Info:');
        console.log(`   Contract Address: ${deployment.contractAddress}`);
        console.log(`   Deployer: ${deployment.deployerAddress}`);
        console.log(`   Platform Wallet: ${deployment.platformFeeWallet}`);
        console.log(`   Transaction: ${deployment.transactionHash}`);
        
        // Check if contract exists
        const code = await provider.getCode(deployment.contractAddress);
        if (code === '0x') {
            console.log('❌ No contract code found at address');
            return;
        }
        
        console.log('✅ Contract code found!');
        console.log(`   Code size: ${(code.length - 2) / 2} bytes`);
        
        // Create contract instance
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const contract = new ethers.Contract(deployment.contractAddress, deployment.abi, wallet);
        
        // Wait a moment for contract to be ready
        console.log('\n⏳ Waiting for contract to be fully deployed...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Test basic functions
        console.log('\n🧪 Testing contract functions...');
        
        try {
            const owner = await contract.owner();
            console.log(`✅ Owner: ${owner}`);
            
            const platformWallet = await contract.platformFeeWallet();
            console.log(`✅ Platform Wallet: ${platformWallet}`);
            
            const allTokens = await contract.getAllTokens();
            console.log(`✅ All Tokens: ${allTokens.length} tokens registered`);
            
            console.log('\n🎉 Contract verification successful!');
            console.log('\n📋 Next Steps:');
            console.log('1. Deploy a demo token: npm run deploy-demo-token');
            console.log('2. Test the AMM: npm run test-amm');
            console.log('3. Use contract address in your frontend');
            
        } catch (error) {
            if (error.message.includes('could not decode result data')) {
                console.log('⚠️  Contract interaction failed - contract might still be initializing');
                console.log('   Try again in a few minutes or check on HashScan');
            } else {
                console.log(`❌ Contract function test failed: ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    }
}

verifyDeployment().catch(console.error);