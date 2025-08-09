const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
    console.log('🚀 Deploying MemeAmmRouter to Hedera Testnet...\n');

    // Validate environment variables
    const requiredEnvVars = ['HEDERA_TESTNET_RPC_URL', 'PRIVATE_KEY', 'PLATFORM_FEE_WALLET'];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            console.error(`❌ Missing required environment variable: ${envVar}`);
            console.log('Please check your .env file and ensure all required variables are set.');
            process.exit(1);
        }
    }

    try {
        // Setup provider and wallet
        const provider = new ethers.JsonRpcProvider(process.env.HEDERA_TESTNET_RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        console.log(`📍 Deployer address: ${wallet.address}`);
        
        // Check balance
        const balance = await provider.getBalance(wallet.address);
        console.log(`💰 Deployer balance: ${ethers.formatEther(balance)} HBAR`);
        
        if (balance < ethers.parseEther('1')) {
            console.warn('⚠️  Low balance detected. Make sure you have enough HBAR for deployment.');
        }

        // Read and compile contract
        const contractPath = path.join(__dirname, '../contracts/MemeAmmRouter.sol');
        const contractSource = fs.readFileSync(contractPath, 'utf8');
        
        console.log('\n📄 Compiling MemeAmmRouter contract...');
        
        // Import OpenZeppelin contracts for compilation
        const solc = require('solc');
        
        // Setup compiler input
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

        // Deploy contract
        console.log('\n🔨 Deploying contract...');
        
        const platformWallet = process.env.PLATFORM_FEE_WALLET;
        
        // Validate platform wallet is a valid address (not ENS)
        if (!platformWallet || !ethers.isAddress(platformWallet)) {
            console.error(`❌ Invalid platform wallet address: ${platformWallet}`);
            console.log('Please provide a valid Ethereum address (0x...) in PLATFORM_FEE_WALLET');
            process.exit(1);
        }
        
        const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
        
        // Estimate gas
        const estimatedGas = await contractFactory.getDeployTransaction(platformWallet).estimateGas || 3000000;
        console.log(`⛽ Estimated gas: ${estimatedGas}`);

        // Deploy with constructor argument
        const deployedContract = await contractFactory.deploy(platformWallet, {
            gasLimit: estimatedGas
        });

        console.log(`📤 Transaction sent: ${deployedContract.deploymentTransaction().hash}`);
        console.log('⏳ Waiting for confirmation...');

        await deployedContract.waitForDeployment();
        const contractAddress = await deployedContract.getAddress();

        console.log('\n✅ MemeAmmRouter deployed successfully!');
        console.log(`📍 Contract address: ${contractAddress}`);
        console.log(`🏦 Platform fee wallet: ${platformWallet}`);
        console.log(`🔗 Explorer: https://hashscan.io/testnet/contract/${contractAddress}`);

        // Save deployment info
        const deploymentInfo = {
            contractAddress: contractAddress,
            deployerAddress: wallet.address,
            platformFeeWallet: platformWallet,
            network: 'hedera-testnet',
            deploymentDate: new Date().toISOString(),
            transactionHash: deployedContract.deploymentTransaction().hash,
            abi: abi
        };

        const deploymentPath = path.join(__dirname, '../deployments');
        if (!fs.existsSync(deploymentPath)) {
            fs.mkdirSync(deploymentPath, { recursive: true });
        }

        fs.writeFileSync(
            path.join(deploymentPath, 'MemeAmmRouter.json'),
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log(`💾 Deployment info saved to: deployments/MemeAmmRouter.json`);
        
        // Test basic contract interaction
        console.log('\n🧪 Testing basic contract interaction...');
        
        const deployedInstance = new ethers.Contract(contractAddress, abi, wallet);
        const owner = await deployedInstance.owner();
        const platformWalletFromContract = await deployedInstance.platformFeeWallet();
        
        console.log(`👤 Contract owner: ${owner}`);
        console.log(`🏦 Platform wallet: ${platformWalletFromContract}`);
        
        if (owner.toLowerCase() === wallet.address.toLowerCase()) {
            console.log('✅ Owner verification successful!');
        } else {
            console.log('❌ Owner verification failed!');
        }

        console.log('\n🎉 Deployment completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Run: npm run deploy-demo-token (to create a test token)');
        console.log('2. Run: npm run test-amm (to test the AMM functionality)');
        console.log('3. Fund your wallet with testnet HBAR if needed');
        console.log('4. Use the contract address in your frontend application');

    } catch (error) {
        console.error('\n❌ Deployment failed:');
        console.error(error.message);
        if (error.code === 'INSUFFICIENT_FUNDS') {
            console.log('\n💡 Make sure your wallet has enough HBAR for deployment.');
            console.log('   Get testnet HBAR from: https://portal.hedera.com/register');
        }
        process.exit(1);
    }
}

main().catch(console.error);
