const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

async function main() {
    // Load deployment info
    const deployment = JSON.parse(fs.readFileSync('./deployments/MemeAmmRouter.json', 'utf8'));
    const abi = deployment.abi;
    const contractAddress = deployment.contractAddress;

    // Setup provider and wallet (read-only, so wallet not strictly needed)
    const provider = new ethers.JsonRpcProvider(process.env.HEDERA_TESTNET_RPC_URL);

    // Create contract instance
    const contract = new ethers.Contract(contractAddress, abi, provider);

    // Test owner()
    try {
        const owner = await contract.owner();
        console.log('owner():', owner);
    } catch (err) {
        console.error('Error calling owner():', err);
    }

    // Test platformFeeWallet()
    try {
        const platformWallet = await contract.platformFeeWallet();
        console.log('platformFeeWallet():', platformWallet);
    } catch (err) {
        console.error('Error calling platformFeeWallet():', err);
    }
}

main().catch(console.error);