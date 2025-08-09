const { 
    Client, 
    PrivateKey, 
    AccountId,
    FileCreateTransaction,
    ContractCreateTransaction,
    ContractFunctionParameters,
    Hbar
} = require("@hashgraph/sdk");
require("dotenv").config();

async function main() {
    console.log("🚀 Deploying MemeAmmRouter via HashIO endpoints...");

    if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_ACCOUNT_PRIVATE_KEY) {
        console.error("❌ Environment variables HEDERA_ACCOUNT_ID and HEDERA_ACCOUNT_PRIVATE_KEY must be present");
        return;
    }

    // Setup account info
    const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    const operatorKey = PrivateKey.fromString(process.env.HEDERA_ACCOUNT_PRIVATE_KEY);
    const platformWallet = process.env.PLATFORM_FEE_WALLET;

    console.log(`📊 Using Hedera account: ${operatorId.toString()}`);
    console.log(`🏦 Platform fee wallet: ${platformWallet}`);
    
    // Use custom network settings with HashIO
    const client = Client.forName("testnet");
    client.setOperator(operatorId, operatorKey);
    
    // Load bytecode and ABI
    console.log("📝 Loading bytecode and ABI...");
    const fs = require("fs");
    const path = require("path");
    
    const bytecodePath = path.resolve(__dirname, "../deployments/MemeAmmRouter_bytecode.txt");
    const abiPath = path.resolve(__dirname, "../deployments/MemeAmmRouter_abi.json");
    
    let bytecode = fs.readFileSync(bytecodePath, "utf8").trim();
    let abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
    console.log("✅ Loaded bytecode and ABI");
    
    // Alternative: Use web3.js and HashIO directly
    console.log("\n🌐 Switching to Web3 deployment via HashIO...");
    
    const { Web3 } = require('web3');
    
    // Connect to Hedera Testnet via HashIO
    const web3 = new Web3(process.env.HEDERA_TESTNET_RPC_URL || "https://testnet.hashio.io/api");
    
    // Set up account
    const account = web3.eth.accounts.privateKeyToAccount('0x' + process.env.HEDERA_ACCOUNT_PRIVATE_KEY);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;
    
    console.log(`🔑 Using EVM address: ${account.address}`);
    
    // Deploy contract
    try {
        const Contract = new web3.eth.Contract(abi);
        
        console.log("🔨 Deploying contract via Web3...");
        
        // Remove 0x prefix if present
        if (bytecode.startsWith("0x")) {
            bytecode = bytecode.substring(2);
        }
        
        // Get platform wallet address
        const platformWalletAddress = platformWallet || account.address;
        console.log(`👛 Using platform wallet: ${platformWalletAddress}`);
        
        // Deploy with constructor arguments
        const deployTx = Contract.deploy({
            data: '0x' + bytecode,
            arguments: [platformWalletAddress]
        });
        
        console.log("⏳ Estimating gas...");
        const gas = await deployTx.estimateGas({
            from: account.address
        }).catch(err => {
            console.error("❌ Gas estimation failed:", err.message);
            return 5000000; // Use default if estimation fails
        });
        
        console.log(`💨 Estimated gas: ${gas}`);
        
        console.log("🚀 Sending deployment transaction...");
        const deployedContract = await deployTx.send({
            from: account.address,
            gas: Math.min(8000000, gas * 1.5), // Use 1.5x estimated gas with cap
            gasPrice: web3.utils.toWei('10', 'gwei')
        });
        
        console.log(`\n✅ CONTRACT DEPLOYED SUCCESSFULLY via Web3!`);
        console.log(`📋 Contract Address: ${deployedContract.options.address}`);
        console.log(`🔗 View on HashScan: https://hashscan.io/testnet/contract/${deployedContract.options.address}`);
        
        // Save deployment info
        const deployInfo = {
            network: "testnet",
            method: "web3-hashio",
            address: deployedContract.options.address,
            deployedAt: new Date().toISOString(),
            platformWallet: platformWalletAddress
        };
        
        fs.writeFileSync(
            path.resolve(__dirname, "../deployments/MemeAmmRouter_Web3.json"),
            JSON.stringify(deployInfo, null, 2)
        );
        
        console.log(`\n💾 Deployment info saved to deployments/MemeAmmRouter_Web3.json`);
        console.log(`\n⚠️ NOTE: It may take a few minutes for the contract to be fully accessible on Hedera.`);
        
    } catch (error) {
        console.error("\n❌ Web3 deployment failed:");
        console.error(error.message);
        
        if (error.receipt) {
            console.log("\nTransaction receipt:", error.receipt);
        }
    }
}

main();
