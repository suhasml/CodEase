const { ethers } = require('ethers');
require('dotenv').config();

// Contract addresses
const ROUTER_ADDRESS = "0x9bB2F81DFFd24f56630BEe8F1995C4eC6EA97028";
const POOL_MANAGER = "0x8B221A4dd0Cb6F57BAA3BE7436D13ab0846143Be";
const FEE_MANAGER = "0x91247990D54A03cF6761Db0d5B39456C5ba4ffe1";

// HashIO RPC URL for Hedera testnet
const HASHIO_RPC_URL = "https://testnet.hashio.io/api";

async function checkContractCode() {
    console.log('🔍 Checking if contracts have code deployed...');
    
    try {
        const provider = new ethers.JsonRpcProvider(HASHIO_RPC_URL);
        
        // Check Router
        console.log('\n📦 Checking Router at:', ROUTER_ADDRESS);
        const routerCode = await provider.getCode(ROUTER_ADDRESS);
        console.log('Router code length:', routerCode.length);
        console.log('Router has code:', routerCode !== '0x');
        
        // Check Pool Manager
        console.log('\n📦 Checking Pool Manager at:', POOL_MANAGER);
        const poolManagerCode = await provider.getCode(POOL_MANAGER);
        console.log('Pool Manager code length:', poolManagerCode.length);
        console.log('Pool Manager has code:', poolManagerCode !== '0x');
        
        // Check Fee Manager
        console.log('\n📦 Checking Fee Manager at:', FEE_MANAGER);
        const feeManagerCode = await provider.getCode(FEE_MANAGER);
        console.log('Fee Manager code length:', feeManagerCode.length);
        console.log('Fee Manager has code:', feeManagerCode !== '0x');
        
        // If all have code, try different function signatures
        if (routerCode !== '0x' && poolManagerCode !== '0x') {
            console.log('\n🔍 Trying alternative function signatures...');
            
            // Try the owner function (from Ownable)
            const ownerableInterface = new ethers.Interface([
                "function owner() view returns (address)"
            ]);
            
            try {
                const routerContract = new ethers.Contract(ROUTER_ADDRESS, ownerableInterface, provider);
                const owner = await routerContract.owner();
                console.log('✅ Router owner:', owner);
            } catch (error) {
                console.log('❌ Router owner call failed:', error.message);
            }
            
            try {
                const poolManagerContract = new ethers.Contract(POOL_MANAGER, ownerableInterface, provider);
                const owner = await poolManagerContract.owner();
                console.log('✅ Pool Manager owner:', owner);
            } catch (error) {
                console.log('❌ Pool Manager owner call failed:', error.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Contract code check failed:', error.message);
    }
}

async function checkHederaContractInfo() {
    console.log('\n🔍 Checking Hedera contract info via HashScan API...');
    
    // The contract IDs from HashScan
    const contracts = [
        { name: 'Pool Manager', id: '0.0.6503211', address: POOL_MANAGER },
        { name: 'Fee Manager', id: '0.0.6503212', address: FEE_MANAGER },
        { name: 'Router', id: '0.0.6503214', address: ROUTER_ADDRESS }
    ];
    
    for (const contract of contracts) {
        console.log(`\n📊 ${contract.name}:`);
        console.log(`  Contract ID: ${contract.id}`);
        console.log(`  EVM Address: ${contract.address}`);
        
        // Convert contract ID to number and back to EVM address to verify
        const contractNum = parseInt(contract.id.split('.')[2]);
        const expectedEvmAddress = `0x${contractNum.toString(16).padStart(40, '0')}`;
        console.log(`  Expected EVM: ${expectedEvmAddress}`);
        console.log(`  Matches: ${expectedEvmAddress.toLowerCase() === contract.address.toLowerCase()}`);
    }
}

async function testSimpleContractCall() {
    console.log('\n🔍 Testing very simple contract calls...');
    
    try {
        const provider = new ethers.JsonRpcProvider(HASHIO_RPC_URL);
        
        // Test with just the bytes4 function selector for getAllTokens
        // getAllTokens() has selector 0x9a12f1f6
        console.log('Testing raw call to getAllTokens...');
        
        const result = await provider.call({
            to: POOL_MANAGER,
            data: '0x9a12f1f6' // getAllTokens() selector
        });
        
        console.log('Raw call result:', result);
        
        if (result === '0x') {
            console.log('❌ Function returned empty data - function might not exist');
        } else {
            console.log('✅ Function returned data:', result);
        }
        
    } catch (error) {
        console.error('❌ Raw call failed:', error.message);
    }
}

async function main() {
    await checkContractCode();
    await checkHederaContractInfo();
    await testSimpleContractCall();
}

main().catch(console.error);
