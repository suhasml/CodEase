const { Client, AccountId, PrivateKey, TransferTransaction, Hbar } = require('@hashgraph/sdk');
require('dotenv').config();

async function transferToEVM() {
    console.log('💸 Transferring HBAR from Hedera Account to EVM Address...\n');
    
    // Your account details
    const hederaAccountId = '0.0.6428617';
    const evmAddress = '0x3Df1c7EfD50bdBB204fDeE98eEa276c55A8e4867';
    const transferAmount = 20; // Transfer 20 HBAR (enough for deployment + testing)
    
    console.log('📋 Transfer Details:');
    console.log(`   From Hedera Account: ${hederaAccountId}`);
    console.log(`   To EVM Address: ${evmAddress}`);
    console.log(`   Amount: ${transferAmount} HBAR`);
    
    try {
        // You need to provide your Hedera account private key (different from EVM key)
        const hederaPrivateKey = process.env.HEDERA_ACCOUNT_PRIVATE_KEY;
        
        if (!hederaPrivateKey) {
            console.error('❌ Missing HEDERA_ACCOUNT_PRIVATE_KEY in .env file');
            console.log('\n💡 You need to add your Hedera account private key to .env:');
            console.log('HEDERA_ACCOUNT_PRIVATE_KEY=your_hedera_account_private_key_here');
            console.log('\nThis is different from the EVM private key!');
            return;
        }
        
        // Setup Hedera client for testnet
        const client = Client.forTestnet().setOperator(
            AccountId.fromString(hederaAccountId),
            PrivateKey.fromString(hederaPrivateKey)
        );
        
        console.log('\n🔄 Creating transfer transaction...');
        
        // Create transfer transaction
        const transferTx = new TransferTransaction()
            .addHbarTransfer(AccountId.fromString(hederaAccountId), Hbar.fromTinybars(-transferAmount * 100000000)) // Negative = sending
            .addHbarTransfer(AccountId.fromEvmAddress(0, 0, evmAddress), Hbar.fromTinybars(transferAmount * 100000000)); // Positive = receiving
        
        // Submit transaction
        const txResponse = await transferTx.execute(client);
        const receipt = await txResponse.getReceipt(client);
        
        console.log('✅ Transfer completed!');
        console.log(`   Transaction ID: ${txResponse.transactionId}`);
        console.log(`   Status: ${receipt.status}`);
        console.log(`   Explorer: https://hashscan.io/testnet/transaction/${txResponse.transactionId}`);
        
        client.close();
        
        console.log('\n🎉 Success! Now you can deploy your contract:');
        console.log('npm run deploy-amm');
        
    } catch (error) {
        console.error('❌ Transfer failed:', error.message);
        
        if (error.message.includes('INVALID_SIGNATURE')) {
            console.log('\n💡 Check your HEDERA_ACCOUNT_PRIVATE_KEY - make sure it matches your account');
        }
    }
}

transferToEVM().catch(console.error);