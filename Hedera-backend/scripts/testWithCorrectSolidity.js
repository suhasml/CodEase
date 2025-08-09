const { Client, AccountId, PrivateKey, ContractCreateTransaction, FileCreateTransaction, Hbar } = require('@hashgraph/sdk');
require('dotenv').config();

async function testWithCorrectSolidity() {
    console.log('🧪 Testing with Solidity 0.8.17 (Hedera Standard)...\n');

    const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    const privateKey = PrivateKey.fromString(process.env.HEDERA_ACCOUNT_PRIVATE_KEY);
    const client = Client.forTestnet().setOperator(accountId, privateKey);

    // Use compatible Solidity version
    const contractSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract HelloWorld {
    string public message;
    
    constructor(string memory _message) {
        message = _message;
    }
    
    function getMessage() public view returns (string memory) {
        return message;
    }
    
    function setMessage(string memory _message) public {
        message = _message;
    }
}`;

    console.log('📄 Compiling with Solidity 0.8.17...');
    
    const solc = require('solc');
    
    // Use the exact compiler version from Hedera docs
    const input = {
        language: 'Solidity',
        sources: {
            'HelloWorld.sol': {
                content: contractSource
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode']
                }
            },
            optimizer: {
                enabled: false  // Disable optimizer initially
            }
        }
    };

    const output = solc.compile(JSON.stringify(input));
    const compilationResult = JSON.parse(output);

    if (compilationResult.errors) {
        console.log('⚠️ Compilation warnings/errors:');
        compilationResult.errors.forEach(error => {
            console.log(`   ${error.severity}: ${error.message}`);
        });
    }

    const contract = compilationResult.contracts['HelloWorld.sol']['HelloWorld'];
    
    if (!contract) {
        console.error('❌ Contract not compiled properly');
        process.exit(1);
    }
    
    const bytecode = contract.evm.bytecode.object;
    
    // Check if bytecode is valid
    if (!bytecode || bytecode.length === 0) {
        console.error('❌ No bytecode generated');
        process.exit(1);
    }
    
    console.log(`✅ Contract compiled successfully!`);
    console.log(`📦 Bytecode length: ${bytecode.length} chars`);
    console.log(`📦 Bytecode size: ${bytecode.length / 2} bytes`);
    console.log(`📦 Bytecode preview: ${bytecode.substring(0, 100)}...`);

    // Convert to bytes properly
    const bytecodeBytes = Buffer.from(bytecode, 'hex');

    // Create file
    console.log('\n📁 Creating bytecode file...');
    
    const fileCreateTx = new FileCreateTransaction()
        .setContents(bytecodeBytes)
        .setKeys([privateKey.publicKey])
        .setMaxTransactionFee(new Hbar(5));

    const fileCreateSubmit = await fileCreateTx.execute(client);
    const fileCreateReceipt = await fileCreateSubmit.getReceipt(client);
    const bytecodeFileId = fileCreateReceipt.fileId;

    console.log(`✅ Bytecode file created: ${bytecodeFileId.toString()}`);

    // Create contract with constructor parameter
    console.log('\n🔨 Creating contract with constructor...');
    
    const { ContractFunctionParameters } = require('@hashgraph/sdk');
    const constructorParams = new ContractFunctionParameters()
        .addString("Hello from Hedera!");
    
    const contractCreateTx = new ContractCreateTransaction()
        .setBytecodeFileId(bytecodeFileId)
        .setGas(1000000)
        .setConstructorParameters(constructorParams)
        .setInitialBalance(new Hbar(0))
        .setMaxTransactionFee(new Hbar(10));

    const contractCreateSubmit = await contractCreateTx.execute(client);
    const contractCreateReceipt = await contractCreateSubmit.getReceipt(client);
    const contractId = contractCreateReceipt.contractId;

    console.log('\n✅ Contract deployed successfully!');
    console.log(`📍 Contract ID: ${contractId.toString()}`);
    console.log(`📍 Contract Address: ${contractId.toSolidityAddress()}`);
    console.log(`📤 Transaction: ${contractCreateSubmit.transactionId.toString()}`);
    console.log(`🔗 Explorer: https://hashscan.io/testnet/contract/${contractId.toString()}`);

    client.close();
    
    console.log('\n🎉 SUCCESS! Contract deployment with constructor worked!');
    console.log('💡 Now we know the proper way to deploy on Hedera.');
}

testWithCorrectSolidity();