const { Client, AccountId, PrivateKey, ContractCreateTransaction, ContractFunctionParameters, FileCreateTransaction, FileAppendTransaction, Hbar, AccountBalanceQuery } = require('@hashgraph/sdk');
const fs = require('fs');
const path = require('path');
const solc = require('solc');
require('dotenv').config();

async function main() {
    console.log('🚀 Deploying MemeAmmRouter to Hedera using Hedera SDK...\n');

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
            const contractPath = require.resolve(path);
            return {
                contents: fs.readFileSync(contractPath, 'utf8')
            };
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

    // Step 1: Create file on Hedera containing the bytecode
    console.log('\n📁 Creating bytecode file on Hedera...');
    console.log(`📦 Bytecode size: ${bytecode.length / 2} bytes`);
    
    // Convert hex string to bytes
    const bytecodeBytes = Buffer.from(bytecode, 'hex');
    console.log(`📦 Bytecode buffer size: ${bytecodeBytes.length} bytes`);
    
    // Hedera file size limit is around 4KB, so we need to chunk large files
    const chunkSize = 4000; // 4KB chunks
    const needsChunking = bytecodeBytes.length > chunkSize;
    
    let bytecodeFileId;
    
    if (needsChunking) {
        console.log(`📝 Large bytecode detected. Chunking into ${chunkSize} byte pieces...`);
        
        // Create initial file with first chunk
        const firstChunk = bytecodeBytes.slice(0, chunkSize);
        console.log(`📄 Creating initial file with ${firstChunk.length} bytes...`);
        
        const fileCreateTx = new FileCreateTransaction()
            .setContents(firstChunk)
            .setKeys([privateKey.publicKey])
            .setMaxTransactionFee(new Hbar(5));

        const fileCreateSubmit = await fileCreateTx.execute(client);
        const fileCreateReceipt = await fileCreateSubmit.getReceipt(client);
        bytecodeFileId = fileCreateReceipt.fileId;
        
        console.log(`✅ Initial file created: ${bytecodeFileId.toString()}`);
        
        // Append remaining chunks
        let offset = chunkSize;
        let chunkNumber = 2;
        
        while (offset < bytecodeBytes.length) {
            const chunk = bytecodeBytes.slice(offset, offset + chunkSize);
            console.log(`📄 Appending chunk ${chunkNumber} with ${chunk.length} bytes...`);
            
            const fileAppendTx = new FileAppendTransaction()
                .setFileId(bytecodeFileId)
                .setContents(chunk)
                .setMaxTransactionFee(new Hbar(5));

            await fileAppendTx.execute(client);
            
            offset += chunkSize;
            chunkNumber++;
        }
        
        console.log(`✅ All chunks appended. Total chunks: ${chunkNumber - 1}`);
        
    } else {
        console.log(`📄 Small bytecode. Creating single file...`);
        
        const fileCreateTx = new FileCreateTransaction()
            .setContents(bytecodeBytes)
            .setKeys([privateKey.publicKey])
            .setMaxTransactionFee(new Hbar(5));

        const fileCreateSubmit = await fileCreateTx.execute(client);
        const fileCreateReceipt = await fileCreateSubmit.getReceipt(client);
        bytecodeFileId = fileCreateReceipt.fileId;
    }
    
    console.log(`✅ Bytecode file created: ${bytecodeFileId.toString()}`);

    // Step 2: Create the contract
    console.log('\n🔨 Creating contract on Hedera...');
    
    const platformWallet = process.env.PLATFORM_FEE_WALLET;
    console.log(`🏦 Platform fee wallet: ${platformWallet}`);

    // Ensure address is properly formatted (remove 0x prefix if present, then add it back)
    const cleanAddress = platformWallet.startsWith('0x') ? platformWallet.slice(2) : platformWallet;
    const formattedAddress = '0x' + cleanAddress.toLowerCase();
    console.log(`🔧 Formatted address: ${formattedAddress}`);

    // Convert EVM address for constructor parameters
    const constructorParams = new ContractFunctionParameters()
        .addAddress(formattedAddress);

    const contractCreateTx = new ContractCreateTransaction()
        .setBytecodeFileId(bytecodeFileId)
        .setGas(3000000)
        .setConstructorParameters(constructorParams)
        .setInitialBalance(new Hbar(0))
        .setMaxTransactionFee(new Hbar(10));

    const contractCreateSubmit = await contractCreateTx.execute(client);
    const contractCreateReceipt = await contractCreateSubmit.getReceipt(client);
    const contractId = contractCreateReceipt.contractId;
    const contractAddress = contractId.toSolidityAddress();

    console.log('\n✅ MemeAmmRouter deployed successfully!');
    console.log(`📍 Contract ID (Hedera): ${contractId.toString()}`);
    console.log(`📍 Contract Address (EVM): ${contractAddress}`);
    console.log(`📤 Transaction: ${contractCreateSubmit.transactionId.toString()}`);
    console.log(`🔗 Explorer: https://hashscan.io/testnet/contract/${contractId.toString()}`);

    // Save deployment info
    const deploymentInfo = {
        contractId: contractId.toString(),
        contractAddress: contractAddress,
        deployerAccountId: accountId.toString(),
        platformFeeWallet: platformWallet,
        network: 'hedera-testnet',
        deploymentDate: new Date().toISOString(),
        transactionId: contractCreateSubmit.transactionId.toString(),
        bytecodeFileId: bytecodeFileId.toString(),
        abi: abi
    };

    const deploymentPath = path.join(__dirname, '../deployments');
    if (!fs.existsSync(deploymentPath)) {
        fs.mkdirSync(deploymentPath, { recursive: true });
    }

    fs.writeFileSync(
        path.join(deploymentPath, 'MemeAmmRouter_Hedera.json'),
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log(`💾 Deployment info saved to: deployments/MemeAmmRouter_Hedera.json`);

    // Close client
    client.close();

    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Verify the contract on HashScan');
    console.log('2. Deploy demo token and test AMM functionality');
    console.log('3. Check your account operations - you should now see ContractCreate transaction');
}

main();