const { Client, AccountId, PrivateKey, AccountBalanceQuery, FileCreateTransaction, Hbar } = require('@hashgraph/sdk');
require('dotenv').config();

async function debugConnection() {
    console.log('🔍 Debugging Hedera Connection...\n');

    const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    const privateKey = PrivateKey.fromString(process.env.HEDERA_ACCOUNT_PRIVATE_KEY);
    const client = Client.forTestnet().setOperator(accountId, privateKey);

    console.log(`📍 Account: ${accountId.toString()}`);
    console.log('🌐 Network: Hedera Testnet');

    // Test 1: Balance query
    console.log('\n🧪 Test 1: Account Balance Query...');
    const balance = await new AccountBalanceQuery()
        .setAccountId(accountId)
        .execute(client);
    console.log(`✅ Balance: ${balance.hbars.toString()}`);

    // Test 2: Small file creation
    console.log('\n🧪 Test 2: Small File Creation...');
    const smallContent = 'Hello Hedera!';
    console.log(`📄 Creating file with content: "${smallContent}"`);
    console.log(`📦 Content size: ${smallContent.length} bytes`);

    const fileCreateTx = new FileCreateTransaction()
        .setContents(smallContent)
        .setKeys([privateKey.publicKey])
        .setMaxTransactionFee(new Hbar(2));

    const fileCreateSubmit = await fileCreateTx.execute(client);
    const fileCreateReceipt = await fileCreateSubmit.getReceipt(client);
    const fileId = fileCreateReceipt.fileId;

    console.log(`✅ File created: ${fileId.toString()}`);
    console.log(`📤 Transaction: ${fileCreateSubmit.transactionId.toString()}`);

    console.log('\n✅ Hedera connection working! File creation successful.');
    console.log('🎯 Ready to deploy contract with large bytecode.');

    client.close();
}

debugConnection();