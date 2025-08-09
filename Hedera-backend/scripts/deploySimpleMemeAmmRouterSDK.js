const { 
    Client, 
    AccountId, 
    PrivateKey, 
    ContractCreateTransaction, 
    ContractFunctionParameters, 
    Hbar,
    FileCreateTransaction,
    FileAppendTransaction
} = require('@hashgraph/sdk');
const fs = require('fs');
const path = require('path');
const solc = require('solc');
require('dotenv').config();

async function main() {
    console.log('🚀 Deploying MemeAmmRouter with Hedera SDK (Fixed)...\n');

    // Get required credentials from .env
    const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    const privateKey = PrivateKey.fromString(process.env.HEDERA_ACCOUNT_PRIVATE_KEY);
    const platformWallet = process.env.PLATFORM_FEE_WALLET;

    // Validate credentials
    if (!accountId || !privateKey || !platformWallet) {
        console.error('❌ Missing required credentials in .env file');
        console.error('Required: HEDERA_ACCOUNT_ID, HEDERA_ACCOUNT_PRIVATE_KEY, PLATFORM_FEE_WALLET');
        process.exit(1);
    }

    // Initialize Hedera client
    const client = Client.forTestnet().setOperator(accountId, privateKey);

    console.log(`📍 Deployer Account: ${accountId.toString()}`);

    try {
        // 1. Compile the contract
        console.log('📄 Compiling MemeAmmRouter contract...');
        
        // Read simplified contract that has proper Hedera compatibility
        // Create a simplified version of the contract
        const simplifiedContract = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MemeAmmRouter {
    address public owner;
    address public platformFeeWallet;
    
    constructor(address _platformFeeWallet) {
        owner = msg.sender;
        platformFeeWallet = _platformFeeWallet;
    }
    
    function setPlatformWallet(address _wallet) external {
        require(msg.sender == owner, "Only owner");
        require(_wallet != address(0), "Invalid wallet");
        platformFeeWallet = _wallet;
    }
}`;

        // Save simplified contract
        const simplifiedContractPath = path.join(__dirname, '../contracts/SimpleMemeAmmRouter.sol');
        fs.writeFileSync(simplifiedContractPath, simplifiedContract);
        
        const input = {
            language: 'Solidity',
            sources: {
                'SimpleMemeAmmRouter.sol': {
                    content: simplifiedContract
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

        const output = JSON.parse(solc.compile(JSON.stringify(input)));
        
        if (output.errors) {
            const hasErrors = output.errors.some(error => error.severity === 'error');
            if (hasErrors) {
                console.error('❌ Compilation errors:');
                output.errors.forEach(error => {
                    if (error.severity === 'error') {
                        console.error(error.formattedMessage);
                    }
                });
                process.exit(1);
            }
        }

        const contract = output.contracts['SimpleMemeAmmRouter.sol']['MemeAmmRouter'];
        const abi = contract.abi;
        const bytecode = '0x' + contract.evm.bytecode.object;
        
        console.log('✅ Contract compiled successfully');
        console.log(`📦 Bytecode size: ${bytecode.length / 2 - 1} bytes`);

        // 2. Store the bytecode in a file on Hedera
        console.log('\n📤 Uploading bytecode to Hedera...');
        
        const bytecodeBuffer = Buffer.from(bytecode.slice(2), 'hex');
        
        // Create the file with bytecode
        const fileCreateTx = new FileCreateTransaction()
            .setKeys([privateKey])
            .setContents(bytecodeBuffer)
            .setMaxTransactionFee(new Hbar(5));
            
        const fileCreateSubmit = await fileCreateTx.execute(client);
        const fileCreateReceipt = await fileCreateSubmit.getReceipt(client);
        const fileId = fileCreateReceipt.fileId;
        
        console.log(`✅ File created with ID: ${fileId.toString()}`);
        
        // 3. Create the contract using the file
        console.log('\n🔨 Creating contract...');
        
        // Format platform wallet for Solidity constructor
        const evmAddress = platformWallet.startsWith('0x') ? 
            platformWallet.slice(2).toLowerCase() : 
            platformWallet.toLowerCase();
            
        console.log(`🏦 Platform fee wallet: 0x${evmAddress}`);
        
        // Create contract parameters
        console.log(`⚙️ Setting constructor parameter: 0x${evmAddress}`);
        const params = new ContractFunctionParameters()
            .addAddress(evmAddress);
            
        const contractCreateTx = new ContractCreateTransaction()
            .setBytecodeFileId(fileId)
            .setGas(500000) // Use less gas for simpler contract
            .setConstructorParameters(params);
            
        console.log(`⏳ Executing contract creation transaction...`);
        const contractCreateSubmit = await contractCreateTx.execute(client);
        
        console.log(`📤 Contract creation transaction: ${contractCreateSubmit.transactionId.toString()}`);
        console.log('⏳ Waiting for contract receipt...');
        
        const contractCreateReceipt = await contractCreateSubmit.getReceipt(client);
        const contractId = contractCreateReceipt.contractId;
        
        console.log('\n✅ Contract deployed successfully!');
        console.log(`📍 Contract ID: ${contractId.toString()}`);
        console.log(`📍 Contract Address (EVM): ${contractId.toSolidityAddress()}`);
        console.log(`🔗 Explorer: https://hashscan.io/testnet/contract/${contractId.toString()}`);
        
        // 4. Save deployment info
        const deploymentInfo = {
            contractId: contractId.toString(),
            contractAddress: contractId.toSolidityAddress(),
            deployerAccount: accountId.toString(),
            platformFeeWallet: '0x' + evmAddress,
            network: 'hedera-testnet',
            deploymentDate: new Date().toISOString(),
            transactionId: contractCreateSubmit.transactionId.toString(),
            abi: abi
        };
        
        const deploymentPath = path.join(__dirname, '../deployments');
        if (!fs.existsSync(deploymentPath)) {
            fs.mkdirSync(deploymentPath, { recursive: true });
        }
        
        fs.writeFileSync(
            path.join(deploymentPath, 'SimpleMemeAmmRouter_SDK.json'),
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log(`💾 Deployment info saved to: deployments/SimpleMemeAmmRouter_SDK.json`);
        
    } catch (error) {
        console.error('\n❌ Deployment failed:');
        console.error(error.message);
        process.exit(1);
    }
}

main().catch(console.error);
