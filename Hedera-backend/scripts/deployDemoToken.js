const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
    console.log('🪙 Deploying Demo Token for AMM Testing...\n');

    // Validate environment variables
    const requiredEnvVars = ['HEDERA_TESTNET_RPC_URL', 'PRIVATE_KEY'];
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

        // Token parameters
        const tokenName = process.env.DEMO_TOKEN_NAME || 'MemeTestCoin';
        const tokenSymbol = process.env.DEMO_TOKEN_SYMBOL || 'MTEST';
        const tokenDecimals = parseInt(process.env.DEMO_TOKEN_DECIMALS || '18');
        const initialSupply = parseInt(process.env.DEMO_TOKEN_SUPPLY || '1000000'); // 1M tokens
        const tokenOwner = wallet.address;

        console.log(`\n🏷️  Token details:`);
        console.log(`   Name: ${tokenName}`);
        console.log(`   Symbol: ${tokenSymbol}`);
        console.log(`   Decimals: ${tokenDecimals}`);
        console.log(`   Initial Supply: ${initialSupply.toLocaleString()} tokens`);
        console.log(`   Owner: ${tokenOwner}`);

        // Read and compile contract
        const contractPath = path.join(__dirname, '../contracts/DemoToken.sol');
        const contractSource = fs.readFileSync(contractPath, 'utf8');
        
        console.log('\n📄 Compiling DemoToken contract...');
        
        const solc = require('solc');
        
        // Setup compiler input
        const input = {
            language: 'Solidity',
            sources: {
                'DemoToken.sol': {
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

        const contract = compilationResult.contracts['DemoToken.sol']['DemoToken'];
        const abi = contract.abi;
        const bytecode = contract.evm.bytecode.object;

        console.log('✅ Contract compiled successfully!');

        // Deploy contract
        console.log('\n🔨 Deploying token contract...');
        
        const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
        
        // Estimate gas
        const estimatedGas = await contractFactory.getDeployTransaction(
            tokenName, 
            tokenSymbol, 
            tokenDecimals, 
            initialSupply, 
            tokenOwner
        ).estimateGas || 2000000;
        
        console.log(`⛽ Estimated gas: ${estimatedGas}`);

        // Deploy with constructor arguments
        const deployedContract = await contractFactory.deploy(
            tokenName,
            tokenSymbol, 
            tokenDecimals,
            initialSupply,
            tokenOwner,
            {
                gasLimit: estimatedGas
            }
        );

        console.log(`📤 Transaction sent: ${deployedContract.deploymentTransaction().hash}`);
        console.log('⏳ Waiting for confirmation...');

        await deployedContract.waitForDeployment();
        const contractAddress = await deployedContract.getAddress();

        console.log('\n✅ Demo Token deployed successfully!');
        console.log(`📍 Contract address: ${contractAddress}`);
        console.log(`🔗 Explorer: https://hashscan.io/testnet/contract/${contractAddress}`);

        // Test basic token functionality
        console.log('\n🧪 Testing token functionality...');
        
        const tokenInstance = new ethers.Contract(contractAddress, abi, wallet);
        
        const name = await tokenInstance.name();
        const symbol = await tokenInstance.symbol();
        const decimals = await tokenInstance.decimals();
        const totalSupply = await tokenInstance.totalSupply();
        const ownerBalance = await tokenInstance.balanceOf(wallet.address);
        
        console.log(`📋 Token verification:`);
        console.log(`   Name: ${name}`);
        console.log(`   Symbol: ${symbol}`);
        console.log(`   Decimals: ${decimals}`);
        console.log(`   Total Supply: ${ethers.formatUnits(totalSupply, decimals)} ${symbol}`);
        console.log(`   Owner Balance: ${ethers.formatUnits(ownerBalance, decimals)} ${symbol}`);

        // Save deployment info
        const deploymentInfo = {
            contractAddress: contractAddress,
            deployerAddress: wallet.address,
            network: 'hedera-testnet',
            deploymentDate: new Date().toISOString(),
            transactionHash: deployedContract.deploymentTransaction().hash,
            tokenInfo: {
                name: name,
                symbol: symbol,
                decimals: Number(decimals),
                totalSupply: totalSupply.toString(),
                initialSupply: initialSupply
            },
            abi: abi
        };

        const deploymentPath = path.join(__dirname, '../deployments');
        if (!fs.existsSync(deploymentPath)) {
            fs.mkdirSync(deploymentPath, { recursive: true });
        }

        fs.writeFileSync(
            path.join(deploymentPath, `DemoToken_${tokenSymbol}.json`),
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log(`💾 Deployment info saved to: deployments/DemoToken_${tokenSymbol}.json`);

        console.log('\n🎉 Demo Token deployment completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Use this token address to create a pool in MemeAmmRouter');
        console.log('2. Run: npm run test-amm (to test AMM with this token)');
        console.log('3. Make sure to approve the AMM router to spend your tokens before creating a pool');
        
        console.log('\n🔧 Environment variable for .env:');
        console.log(`DEMO_TOKEN_ADDRESS=${contractAddress}`);

    } catch (error) {
        console.error('\n❌ Token deployment failed:');
        console.error(error.message);
        if (error.code === 'INSUFFICIENT_FUNDS') {
            console.log('\n💡 Make sure your wallet has enough HBAR for deployment.');
        }
        process.exit(1);
    }
}

main().catch(console.error);