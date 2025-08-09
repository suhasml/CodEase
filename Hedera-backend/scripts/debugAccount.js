const { ethers } = require('ethers');
require('dotenv').config();

async function debugAccount() {
    console.log('🔍 Debugging Account Information...\n');

    // Your provided details
    const providedPrivateKey = '0x93c3b664340ad826107f7a578a86495a878ee18b9e90db890123c175ffa19855';
    
    try {
        // Setup provider
        const provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');
        
        // Create wallet from your private key
        const wallet = new ethers.Wallet(providedPrivateKey, provider);
        
        console.log('📋 Account Details:');
        console.log(`   Private Key: ${providedPrivateKey}`);
        console.log(`   EVM Address: ${wallet.address}`);
        
        // Check balance
        const balance = await provider.getBalance(wallet.address);
        console.log(`   Balance: ${ethers.formatEther(balance)} HBAR`);
        
        // Test connection
        const blockNumber = await provider.getBlockNumber();
        console.log(`   Latest Block: ${blockNumber}`);
        
        // Check if this matches your expected address
        console.log('\n🔍 Expected vs Actual:');
        console.log(`   Your Hedera Account ID: 0.0.6428617`);
        console.log(`   Your Hedera Balance: 915.30665856 HBAR`);
        console.log(`   EVM Address from Private Key: ${wallet.address}`);
        console.log(`   EVM Balance: ${ethers.formatEther(balance)} HBAR`);
        
        if (balance > 0) {
            console.log('\n✅ Account has HBAR - ready for deployment!');
        } else {
            console.log('\n❌ EVM address has no HBAR');
            console.log('\n💡 Solutions:');
            console.log('1. Transfer HBAR from your Hedera account to this EVM address');
            console.log('2. Use a different private key that has HBAR');
            console.log('3. Get the correct EVM private key for your funded account');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

debugAccount().catch(console.error);