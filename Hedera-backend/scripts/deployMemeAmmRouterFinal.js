const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
    console.log('🚀 Deploying MemeAmmRouter to Hedera Testnet (Final Version)...\n');

    // Validate environment variables
    const requiredEnvVars = ['HEDERA_TESTNET_RPC_URL', 'PRIVATE_KEY', 'PLATFORM_FEE_WALLET'];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            console.error(`❌ Missing required environment variable: ${envVar}`);
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

        // Get flattened contract code for MemeAmmRouter
        console.log('\n📄 Loading MemeAmmRouter contract...');
        
        // Use the regular contract
        const contractPath = path.join(__dirname, '../contracts/MemeAmmRouter.sol');
        console.log('📄 Using standard contract version');
        
        const contractSource = fs.readFileSync(contractPath, 'utf8');
        
        console.log('\n📄 Compiling MemeAmmRouter contract...');
        
        // Import compiler
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

        // Handle imports for non-flattened contracts
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

        // Compile the contract
        const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
        
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

        // Extract contract data
        const contract = output.contracts['MemeAmmRouter.sol']['MemeAmmRouter'];
        const abi = contract.abi;
        const bytecode = contract.evm.bytecode.object;

        console.log('✅ Contract compiled successfully!');
        console.log(`📦 Bytecode size: ${bytecode.length / 2} bytes`);

        // Deploy contract
        console.log('\n🔨 Deploying contract to Hedera Testnet...');
        
        const platformWallet = process.env.PLATFORM_FEE_WALLET;
        console.log(`🏦 Platform fee wallet: ${platformWallet}`);
        
        // Create contract factory
        const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
        
        // Deploy with limited parameters for Hedera compatibility
        const deployedContract = await contractFactory.deploy(
            platformWallet,
            { 
                gasLimit: 5000000  // Higher gas limit for complex contract
            }
        );
        
        console.log(`📤 Transaction sent: ${deployedContract.deploymentTransaction().hash}`);
        console.log('⏳ Waiting for confirmation (this may take a while)...');

        // Wait with higher confirmation count for Hedera
        await deployedContract.waitForDeployment();
        console.log('📥 Transaction confirmed! Getting contract address...');
        
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
            path.join(deploymentPath, 'MemeAmmRouter_Final.json'),
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log(`💾 Deployment info saved to: deployments/MemeAmmRouter_Final.json`);

        console.log('\n⚠️ IMPORTANT HEDERA NOTICE ⚠️');
        console.log('Contract was deployed to Hedera Testnet, but due to Hedera\'s architecture,');
        console.log('contract functions may not be immediately available.');
        console.log('Wait 2-5 minutes before testing contract functions.');
        console.log('For production use, consider using the Hedera SDK approach instead of EVM compatibility.');

    } catch (error) {
        console.error('\n❌ Deployment failed:');
        console.error(error.message);
        process.exit(1);
    }
}

main().catch(console.error);
