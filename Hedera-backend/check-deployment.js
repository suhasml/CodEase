const { ethers } = require('ethers');
require('dotenv').config();

// Contract addresses - UPDATED WITH FRESH DEPLOYMENT
const ROUTER_ADDRESS = "0x513e413B8Ceed9224719D87a35c80cC52C36BCEF";
const POOL_MANAGER = "0x22807029b93EF69a27f90d5D68785f1cd8209318";
const FEE_MANAGER = "0xF0e0f26b7E73C313dF011a22121dBfB2dE51179d";

// HashIO RPC URL for Hedera testnet
const HASHIO_RPC_URL = "https://testnet.hashio.io/api";

async function checkDeployment() {
    console.log('🔍 Checking what\'s actually deployed at contract addresses...');
    
    try {
        const provider = new ethers.JsonRpcProvider(HASHIO_RPC_URL);
        
        // Check each contract address
        const addresses = [
            { name: 'Router', address: ROUTER_ADDRESS },
            { name: 'PoolManager', address: POOL_MANAGER },
            { name: 'FeeManager', address: FEE_MANAGER }
        ];
        
        for (const contract of addresses) {
            console.log(`\n📍 Checking ${contract.name}: ${contract.address}`);
            
            try {
                // Get bytecode
                const code = await provider.getCode(contract.address);
                console.log(`✅ Bytecode length: ${code.length} characters`);
                
                if (code === '0x') {
                    console.log('❌ No contract deployed at this address!');
                } else {
                    console.log('✅ Contract is deployed');
                    
                    // Try to call a simple function to see if it responds
                    try {
                        // Try the most basic call - just sending data to see what happens
                        const result = await provider.call({
                            to: contract.address,
                            data: '0x' // Empty call data
                        });
                        console.log(`📞 Empty call result: ${result}`);
                    } catch (callError) {
                        console.log(`⚠️ Empty call failed: ${callError.message}`);
                    }
                }
            } catch (error) {
                console.error(`❌ Failed to check ${contract.name}:`, error.message);
            }
        }
        
        // Also check the token that was created
        console.log('\n📍 Checking created token: 0x0000000000000000000000000000000000633b56');
        const tokenCode = await provider.getCode('0x0000000000000000000000000000000000633b56');
        console.log(`✅ Token bytecode length: ${tokenCode.length} characters`);
        
    } catch (error) {
        console.error('❌ Deployment check failed:', error.message);
    }
}

checkDeployment().catch(console.error);
