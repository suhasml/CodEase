const { Client, AccountId, PrivateKey, ContractCreateTransaction, FileCreateTransaction, Hbar, AccountBalanceQuery } = require('@hashgraph/sdk');
require('dotenv').config();

async function deploySimpleContract() {
    console.log('🧪 Testing Simple Contract Deployment (No Constructor)...\n');

    const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    const privateKey = PrivateKey.fromString(process.env.HEDERA_ACCOUNT_PRIVATE_KEY);
    const client = Client.forTestnet().setOperator(accountId, privateKey);

    // Simple contract with no constructor
    const simpleContractSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleTest {
    uint256 public value = 42;
    
    function getValue() public view returns (uint256) {
        return value;
    }
    
    function setValue(uint256 _value) public {
        value = _value;
    }
}`;

    console.log('📄 Compiling simple test contract...');
    
    const solc = require('solc');
    
    const input = {
        language: 'Solidity',
        sources: {
            'SimpleTest.sol': {
                content: simpleContractSource
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode']
                }
            },
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    };

    const output = solc.compile(JSON.stringify(input));
    const compilationResult = JSON.parse(output);

    if (compilationResult.errors) {
        const hasErrors = compilationResult.errors.some(error => error.severity === 'error');
        if (hasErrors) {
            console.error('❌ Compilation errors:');
            compilationResult.errors.forEach(error => {
                if (error.severity === 'error') {
                    console.error(error.formattedMessage);
                }
            });
            process.exit(1);
        }
    }

    const contract = compilationResult.contracts['SimpleTest.sol']['SimpleTest'];
    const bytecode = contract.evm.bytecode.object;
    const bytecodeBytes = Buffer.from(bytecode, 'hex');

    console.log(`✅ Simple contract compiled successfully!`);
    console.log(`📦 Bytecode size: ${bytecodeBytes.length} bytes`);

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

    // Create contract WITHOUT constructor parameters
    console.log('\n🔨 Creating simple contract (no constructor)...');
    
    const contractCreateTx = new ContractCreateTransaction()
        .setBytecodeFileId(bytecodeFileId)
        .setGas(1000000)
        .setInitialBalance(new Hbar(0))
        .setMaxTransactionFee(new Hbar(10));

    const contractCreateSubmit = await contractCreateTx.execute(client);
    const contractCreateReceipt = await contractCreateSubmit.getReceipt(client);
    const contractId = contractCreateReceipt.contractId;

    console.log('\n✅ Simple contract deployed successfully!');
    console.log(`📍 Contract ID: ${contractId.toString()}`);
    console.log(`📍 Contract Address: ${contractId.toSolidityAddress()}`);
    console.log(`📤 Transaction: ${contractCreateSubmit.transactionId.toString()}`);

    client.close();
    
    console.log('\n🎉 Simple contract deployment successful!');
    console.log('🔧 This confirms Hedera contract creation works.');
    console.log('💡 Issue with MemeAmmRouter is likely constructor parameters.');
}

deploySimpleContract();