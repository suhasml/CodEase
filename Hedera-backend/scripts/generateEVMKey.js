const { ethers } = require('ethers');
const { PrivateKey } = require('@hashgraph/sdk');

/**
 * Helper script to generate EVM private key
 * Run: node scripts/generateEVMKey.js
 */

function generateEVMKey() {
    console.log('\n🔑 EVM Private Key Generator');
    console.log('━'.repeat(50));
    
    // Method 1: Generate completely new EVM wallet
    console.log('\n📝 Method 1: Generate New EVM Wallet');
    const newWallet = ethers.Wallet.createRandom();
    console.log(`Private Key: ${newWallet.privateKey}`);
    console.log(`Address: ${newWallet.address}`);
    console.log(`Mnemonic: ${newWallet.mnemonic.phrase}`);
    
    // Method 2: Convert from Hedera private key (if you have one)
    console.log('\n📝 Method 2: Convert from Hedera Key');
    console.log('If you have a Hedera private key, you can convert it:');
    
    // Example conversion (replace with your actual Hedera key)
    try {
        // This is just an example - replace with your actual key
        const exampleHederaKey = process.env.OPERATOR_KEY || PrivateKey.generateED25519().toString();
        const hederaPrivateKey = PrivateKey.fromString(exampleHederaKey);
        
        // Convert to ECDSA for EVM compatibility
        const ecdsaKey = PrivateKey.generateECDSA();
        console.log(`ECDSA Private Key: ${ecdsaKey.toString()}`);
        console.log(`ECDSA Public Key: ${ecdsaKey.publicKey.toString()}`);
        
        // Create ethers wallet from raw key
        const evmWallet = new ethers.Wallet(ecdsaKey.toString());
        console.log(`EVM Address: ${evmWallet.address}`);
        
    } catch (error) {
        console.log('⚠️  To convert your Hedera key, set OPERATOR_KEY in .env first');
    }
    
    console.log('\n✅ Instructions:');
    console.log('1. Copy one of the private keys above');
    console.log('2. Add it to your .env file as OPERATOR_EVM_KEY');
    console.log('3. Make sure you have HBAR in this account for gas fees');
    console.log('\n⚠️  Keep these keys secure and never share them!');
}

// Method 3: If you want to use HashPack or other wallet
function displayWalletInstructions() {
    console.log('\n📱 Method 3: Use Existing Wallet');
    console.log('━'.repeat(30));
    console.log('If you have HashPack, MetaMask, or other wallet:');
    console.log('1. Export your private key from the wallet');
    console.log('2. Use that as your OPERATOR_EVM_KEY');
    console.log('3. Make sure it has HBAR for gas fees');
    console.log('\n🔗 HashPack: https://www.hashpack.app/');
    console.log('🔗 MetaMask: https://metamask.io/');
}

if (require.main === module) {
    generateEVMKey();
    displayWalletInstructions();
}

module.exports = { generateEVMKey }; 