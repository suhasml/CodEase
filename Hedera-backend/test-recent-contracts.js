const { ethers } = require('ethers');
require('dotenv').config();

// HashIO RPC URL for Hedera testnet
const HASHIO_RPC_URL = "https://testnet.hashio.io/api";

async function testRecentContracts() {
    console.log('🔍 Testing recent contract deployments...');
    
    try {
        const provider = new ethers.JsonRpcProvider(HASHIO_RPC_URL);
        
        // Based on the contract IDs we found: 0.0.6503274 and 0.0.6503281
        // Let's convert these to EVM addresses and test them
        const contractIds = [6503274, 6503275, 6503276, 6503277, 6503278, 6503279, 6503280, 6503281, 6503282, 6503283];
        
        for (const id of contractIds) {
            // Convert contract ID to EVM address
            const evmAddress = `0x${id.toString(16).padStart(40, '0')}`;
            console.log(`\n📍 Testing contract 0.0.${id} -> ${evmAddress}`);
            
            try {
                // Check if there's bytecode at this address
                const code = await provider.getCode(evmAddress);
                
                if (code === '0x') {
                    console.log('❌ No bytecode at this address');
                } else {
                    console.log(`✅ Contract found! Bytecode length: ${code.length}`);
                    
                    // Try to call some common functions to identify what type of contract this is
                    try {
                        // Try PoolManager functions
                        const poolManagerContract = new ethers.Contract(evmAddress, [
                            "function getAllTokens() external view returns (address[] memory)",
                            "function router() external view returns (address)"
                        ], provider);
                        
                        try {
                            const allTokens = await poolManagerContract.getAllTokens();
                            console.log(`🎯 This appears to be PoolManager! All tokens: ${allTokens.length}`);
                            
                            const router = await poolManagerContract.router();
                            console.log(`🔗 Router address: ${router}`);
                        } catch (e) {
                            console.log('⚠️ Not a PoolManager or function failed');
                        }
                        
                    } catch (error) {
                        console.log('⚠️ PoolManager test failed, trying Router...');
                        
                        // Try Router functions
                        try {
                            const routerContract = new ethers.Contract(evmAddress, [
                                "function poolManager() external view returns (address)",
                                "function feeManager() external view returns (address)"
                            ], provider);
                            
                            const poolManager = await routerContract.poolManager();
                            const feeManager = await routerContract.feeManager();
                            console.log(`🎯 This appears to be Router!`);
                            console.log(`🔗 Pool Manager: ${poolManager}`);
                            console.log(`🔗 Fee Manager: ${feeManager}`);
                        } catch (e) {
                            console.log('⚠️ Not a Router either');
                        }
                    }
                }
            } catch (error) {
                console.log(`❌ Error testing contract: ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testRecentContracts().catch(console.error);
