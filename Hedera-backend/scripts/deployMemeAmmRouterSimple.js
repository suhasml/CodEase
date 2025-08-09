const { 
    Client, 
    AccountId, 
    PrivateKey, 
    ContractCreateTransaction, 
    ContractFunctionParameters, 
    Hbar, 
    AccountBalanceQuery,
    FileCreateTransaction,
    FileAppendTransaction
} = require('@hashgraph/sdk');
const fs = require('fs');
const path = require('path');
const solc = require('solc');
require('dotenv').config();

async function main() {
    console.log('🚀 Deploying MemeAmmRouter to Hedera using Split Process...\n');

    // Validate environment variables
    const requiredEnvVars = ['HEDERA_ACCOUNT_ID', 'HEDERA_ACCOUNT_PRIVATE_KEY', 'PLATFORM_FEE_WALLET'];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            console.error(`❌ Missing required environment variable: ${envVar}`);
            console.log('Required for Hedera SDK deployment:');
            console.log('HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID');
            console.log('HEDERA_ACCOUNT_PRIVATE_KEY=302e020100300506032b657003220420...');
            console.log('PLATFORM_FEE_WALLET=0x...');
            process.exit(1);
        }
    }

    try {
        // Setup Hedera client
        const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
        const privateKey = PrivateKey.fromString(process.env.HEDERA_ACCOUNT_PRIVATE_KEY);
        const client = Client.forTestnet().setOperator(accountId, privateKey);

        console.log(`📍 Deployer Account: ${accountId.toString()}`);
        
        // Check balance
        const accountBalance = await new AccountBalanceQuery()
            .setAccountId(accountId)
            .execute(client);
        console.log(`💰 Account balance: ${accountBalance.hbars.toString()}`);

        // Read and compile contract
        const contractPath = path.join(__dirname, '../contracts/MemeAmmRouter.sol');
        const contractSource = fs.readFileSync(contractPath, 'utf8');
        
        console.log('\n📄 Compiling MemeAmmRouter contract...');
        
        // Setup compiler input with proper imports
        const input = {
            language: 'Solidity',
            sources: {
                'MemeAmmRouter.sol': {
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
                    enabled: true,
                    runs: 200
                }
            }
        };

        // Find imports callback for OpenZeppelin contracts
        function findImports(path) {
            if (path.startsWith('@openzeppelin/')) {
                try {
                    const contractPath = require.resolve(path);
                    return {
                        contents: fs.readFileSync(contractPath, 'utf8')
                    };
                } catch (e) {
                    return { error: 'File not found' };
                }
            }
            return { error: 'File not found' };
        }

        const output = solc.compile(JSON.stringify(input), { import: findImports });
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

        const contract = compilationResult.contracts['MemeAmmRouter.sol']['MemeAmmRouter'];
        const abi = contract.abi;
        const bytecode = contract.evm.bytecode.object;

        console.log('✅ Contract compiled successfully!');
        console.log(`📦 Bytecode size: ${bytecode.length / 2} bytes`);

        // Create a file on Hedera with the bytecode
        console.log('\n📁 Creating bytecode file on Hedera...');
        
        // Convert hex string to bytes
        const bytecodeBytes = Buffer.from(bytecode, 'hex');
        console.log(`📦 Bytecode buffer size: ${bytecodeBytes.length} bytes`);
        
        // Create file with bytecode
        const fileCreateTx = await new FileCreateTransaction()
            .setKeys([privateKey])
            .setContents(bytecodeBytes)
            .setMaxTransactionFee(new Hbar(5))
            .execute(client);
            
        const fileCreateReceipt = await fileCreateTx.getReceipt(client);
        const bytecodeFileId = fileCreateReceipt.fileId;
        console.log(`✅ Bytecode file created: ${bytecodeFileId.toString()}`);
        
        // Deploy contract using the file
        console.log('\n🔨 Creating contract from file...');
        
        const platformWallet = process.env.PLATFORM_FEE_WALLET;
        console.log(`🏦 Platform fee wallet: ${platformWallet}`);

        // Ensure address is properly formatted
        const cleanAddress = platformWallet.startsWith('0x') ? platformWallet.slice(2) : platformWallet;
        const formattedAddress = '0x' + cleanAddress.toLowerCase();
        console.log(`🔧 Formatted address: ${formattedAddress}`);

        // Create contract transaction
        const constructorParams = new ContractFunctionParameters()
            .addAddress(formattedAddress);
            
        const contractCreateTx = await new ContractCreateTransaction()
            .setBytecodeFileId(bytecodeFileId)
            .setGas(3000000)
            .setConstructorParameters(constructorParams)
            .execute(client);
            
        const contractCreateReceipt = await contractCreateTx.getReceipt(client);
        const contractId = contractCreateReceipt.contractId;
        
        console.log('\n✅ MemeAmmRouter deployed successfully!');
        console.log(`📍 Contract ID (Hedera): ${contractId.toString()}`);
        
        const contractAddress = contractId.toSolidityAddress();
        console.log(`📍 Contract Address (EVM): ${contractAddress}`);
        console.log(`🔗 Explorer: https://hashscan.io/testnet/contract/${contractId.toString()}`);

        // Save deployment info
        const deploymentInfo = {
            contractId: contractId.toString(),
            contractAddress: contractAddress,
            deployerAccount: accountId.toString(),
            platformFeeWallet: formattedAddress,
            network: 'hedera-testnet',
            deploymentDate: new Date().toISOString(),
            transactionId: contractCreateTx.transactionId.toString(),
            abi: abi
        };

        const deploymentPath = path.join(__dirname, '../deployments');
        if (!fs.existsSync(deploymentPath)) {
            fs.mkdirSync(deploymentPath, { recursive: true });
        }

        fs.writeFileSync(
            path.join(deploymentPath, 'MemeAmmRouter_Hedera_Success.json'),
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log(`💾 Deployment info saved to: deployments/MemeAmmRouter_Hedera_Success.json`);
        
        console.log('\n🎉 Deployment completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Run: npm run deploy-demo-token (to create a test token)');
        console.log('2. Run: npm run test-amm (to test the AMM functionality)');
        console.log('3. Fund your wallet with testnet HBAR if needed');
        console.log('4. Use the contract address in your frontend application');

    } catch (error) {
        console.error('\n❌ Deployment failed:');
        console.error(error.message);
        
        if (error.status && error.status._code) {
            console.log(`\n💡 Hedera Error Code: ${error.status._code}`);
            
            // Common Hedera error codes and solutions
            const errorCodes = {
                7: "INSUFFICIENT_PAYER_BALANCE - Add more HBAR to your account",
                10: "INVALID_CONTRACT_ID - The contract ID format is incorrect",
                11: "INVALID_TRANSACTION - The transaction is invalid, check parameters",
                21: "INVALID_SIGNATURE - Check your private key",
                82: "ERROR_DECODING_BYTESTRING - Try optimizing your contract or check constructor parameters"
            };
            
            if (errorCodes[error.status._code]) {
                console.log(`💡 Error meaning: ${errorCodes[error.status._code]}`);
            }
        }
        
        process.exit(1);
    }
}

main().catch(error => {
    console.error('\n❌ Unexpected error:');
    console.error(error);
    process.exit(1);
});
