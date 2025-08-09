const { Client, AccountId, PrivateKey, ContractCreateFlow, ContractFunctionParameters, Hbar, AccountBalanceQuery } = require('@hashgraph/sdk');
const fs = require('fs');
const path = require('path');
const solc = require('solc');
require('dotenv').config();

async function main() {
    console.log('🚀 Deploying MemeAmmRouter to Hedera using Improved SDK Flow...\n');

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

        // Deploy using ContractCreateFlow (more reliable)
        console.log('\n🔨 Creating contract on Hedera using ContractCreateFlow...');
        
        const platformWallet = process.env.PLATFORM_FEE_WALLET;
        console.log(`🏦 Platform fee wallet: ${platformWallet}`);

        // Ensure address is properly formatted
        const cleanAddress = platformWallet.startsWith('0x') ? platformWallet.slice(2) : platformWallet;
        const formattedAddress = '0x' + cleanAddress.toLowerCase();
        console.log(`🔧 Formatted address: ${formattedAddress}`);

        // Convert EVM address for constructor parameters
        const constructorParams = new ContractFunctionParameters()
            .addAddress(formattedAddress);

        // Create contract directly using ContractCreateFlow
        console.log('⏳ Submitting contract creation transaction...');
        
        const contractCreateFlow = new ContractCreateFlow()
            .setGas(3000000)
            .setConstructorParameters(constructorParams)
            .setBytecode(bytecode)
            .setMaxTransactionFee(new Hbar(15));
            
        console.log('📤 Executing transaction...');
        const txResponse = await contractCreateFlow.execute(client);
        
        console.log('⏳ Waiting for receipt...');
        const receipt = await txResponse.getReceipt(client);
        
        const contractId = receipt.contractId;
        console.log(`✅ Contract created with ID: ${contractId.toString()}`);
        
        const contractAddress = contractId.toSolidityAddress();
        console.log(`📍 Contract EVM Address: ${contractAddress}`);
        
        // Save deployment info
        const deploymentInfo = {
            contractId: contractId.toString(),
            contractAddress: contractAddress,
            deployerAccount: accountId.toString(),
            platformFeeWallet: formattedAddress,
            network: 'hedera-testnet',
            deploymentDate: new Date().toISOString(),
            transactionId: txResponse.transactionId.toString(),
            abi: abi
        };

        const deploymentPath = path.join(__dirname, '../deployments');
        if (!fs.existsSync(deploymentPath)) {
            fs.mkdirSync(deploymentPath, { recursive: true });
        }

        const deploymentFilePath = path.join(deploymentPath, 'MemeAmmRouter_Hedera_Direct.json');
        fs.writeFileSync(
            deploymentFilePath,
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log(`💾 Deployment info saved to: ${deploymentFilePath}`);
        console.log(`🔗 Explorer: https://hashscan.io/testnet/contract/${contractId.toString()}`);
        
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
