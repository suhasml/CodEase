const { ethers } = require('ethers');
require('dotenv').config();

// HashIO RPC URL for Hedera testnet
const HASHIO_RPC_URL = "https://testnet.hashio.io/api";

async function analyzeContracts() {
    console.log('🔍 Analyzing found contracts...');
    
    try {
        const provider = new ethers.JsonRpcProvider(HASHIO_RPC_URL);
        
        const contracts = [
            { id: '0.0.6503274', address: '0x0000000000000000000000000000000000633b6a' },
            { id: '0.0.6503281', address: '0x0000000000000000000000000000000000633b71' }
        ];
        
        for (const contract of contracts) {
            console.log(`\n📍 Analyzing ${contract.id} -> ${contract.address}`);
            
            // Try different function signatures that might exist
            const testFunctions = [
                // PoolManager functions
                { sig: 'getAllTokens()', desc: 'PoolManager.getAllTokens' },
                { sig: 'router()', desc: 'PoolManager.router' },
                { sig: 'platformFeeWallet()', desc: 'PoolManager.platformFeeWallet' },
                { sig: 'owner()', desc: 'Ownable.owner' },
                
                // Router functions  
                { sig: 'poolManager()', desc: 'Router.poolManager' },
                { sig: 'feeManager()', desc: 'Router.feeManager' },
                
                // FeeManager functions
                { sig: 'platformWallet()', desc: 'FeeManager.platformWallet' },
                
                // Common functions
                { sig: 'name()', desc: 'Token.name' },
                { sig: 'symbol()', desc: 'Token.symbol' }
            ];
            
            for (const func of testFunctions) {
                try {
                    // Create a simple contract interface for this function
                    const testContract = new ethers.Contract(contract.address, [
                        `function ${func.sig.replace('()', '() view returns (string)')}`,
                        `function ${func.sig.replace('()', '() view returns (address)')}`,
                        `function ${func.sig.replace('()', '() view returns (address[])')}`,
                        `function ${func.sig.replace('()', '() view returns (uint256)')}`
                    ], provider);
                    
                    // Get the function name from signature
                    const funcName = func.sig.split('(')[0];
                    
                    try {
                        const result = await testContract[funcName]();
                        console.log(`✅ ${func.desc}: ${result}`);
                        
                        // If this is a successful call, this might be our contract type
                        if (func.desc.includes('PoolManager')) {
                            console.log(`🎯 This appears to be a PoolManager contract!`);
                        } else if (func.desc.includes('Router')) {
                            console.log(`🎯 This appears to be a Router contract!`);
                        } else if (func.desc.includes('FeeManager')) {
                            console.log(`🎯 This appears to be a FeeManager contract!`);
                        }
                    } catch (e) {
                        // Function doesn't exist or failed, continue
                    }
                } catch (e) {
                    // ABI error, continue
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Analysis failed:', error.message);
    }
}

analyzeContracts().catch(console.error);
