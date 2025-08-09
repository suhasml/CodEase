const { 
    Client, 
    PrivateKey, 
    AccountId,
    FileCreateTransaction,
    ContractCreateTransaction,
    ContractFunctionParameters,
    Hbar,
    TransactionId,
    Transaction
} = require("@hashgraph/sdk");
require("dotenv").config();

async function main() {
    console.log("🚀 Starting Simplified MemeAmmRouter Deployment...");

    // Check for environment variables
    if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_ACCOUNT_PRIVATE_KEY) {
        console.error("❌ Environment variables missing! Check .env file");
        return;
    }

    // Setup client with MAINNET to avoid network issues
    const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    const operatorKey = PrivateKey.fromString(process.env.HEDERA_ACCOUNT_PRIVATE_KEY);
    const platformWallet = process.env.PLATFORM_FEE_WALLET;

    console.log(`📊 Using account: ${operatorId.toString()}`);
    console.log(`🏦 Platform wallet: ${platformWallet || "UNDEFINED - CHECK ENV"}`);

    // Create client
    console.log("🔄 Setting up client...");
    const client = Client.forTestnet();
    client.setOperator(operatorId, operatorKey);
    
    // Set network nodes manually to ensure connectivity
    client.setMaxNodeAttempts(5);
    client.setRequestTimeout(60000); // 60 seconds timeout
    
    try {
        // Load bytecode
        const fs = require("fs");
        const path = require("path");
        const bytecodePath = path.resolve(__dirname, "../deployments/MemeAmmRouter_bytecode.txt");
        
        console.log("📄 Loading bytecode...");
        const bytecode = fs.readFileSync(bytecodePath, "utf8").trim();
        console.log(`📏 Bytecode size: ${bytecode.length / 2} bytes`);
        
        // Prepare bytecode buffer
        const bytecodeBuffer = Buffer.from(bytecode, "hex");
        
        // STEP 1: Create a file on Hedera containing the bytecode
        console.log("\n📂 STEP 1: Creating File Transaction...");
        
        // Use a unique transaction ID with a valid start time
        const validStart = new Date();
        validStart.setSeconds(validStart.getSeconds() + 10); // Start 10 seconds in the future
        
        const fileCreateTx = new FileCreateTransaction()
            .setKeys([operatorKey])
            .setContents(bytecodeBuffer)
            .setMaxTransactionFee(new Hbar(15))
            .freezeWith(client);
            
        // Sign and execute
        console.log("🔑 Signing file transaction...");
        const fileCreateSign = await fileCreateTx.sign(operatorKey);
        
        console.log("🚀 Submitting file transaction...");
        const fileSubmit = await fileCreateSign.execute(client);
        
        console.log("⏳ Waiting for file receipt...");
        const fileReceipt = await fileSubmit.getReceipt(client);
        
        const fileId = fileReceipt.fileId;
        console.log(`✅ File created with ID: ${fileId.toString()}`);
        
        // STEP 2: Create the contract
        console.log("\n📝 STEP 2: Creating Contract Transaction...");
        
        // Format platform wallet for parameter (remove 0x if present)
        const formattedWallet = platformWallet?.startsWith("0x") 
            ? platformWallet.substring(2) 
            : platformWallet;
            
        console.log(`👛 Using wallet address for constructor: ${formattedWallet}`);
        
        // Prepare constructor parameters
        const constructorParams = new ContractFunctionParameters()
            .addAddress(formattedWallet);
            
        console.log("🔄 Creating contract transaction...");
        const contractTx = new ContractCreateTransaction()
            .setBytecodeFileId(fileId)
            .setGas(4000000) // Increase gas limit
            .setConstructorParameters(constructorParams)
            .setMaxTransactionFee(new Hbar(30))
            .freezeWith(client);
            
        console.log("🔑 Signing contract transaction...");
        const contractSign = await contractTx.sign(operatorKey);
        
        console.log("🚀 Submitting contract transaction...");
        const contractSubmit = await contractSign.execute(client);
        
        console.log("⏳ Waiting for contract receipt...");
        const contractReceipt = await contractSubmit.getReceipt(client);
        
        // Get the contract ID and address
        const contractId = contractReceipt.contractId;
        console.log(`\n✅ CONTRACT DEPLOYED SUCCESSFULLY!`);
        console.log(`📋 Contract ID: ${contractId.toString()}`);
        console.log(`📋 Contract Address: ${contractId.toSolidityAddress()}`);
        console.log(`🔗 View on HashScan: https://hashscan.io/testnet/contract/${contractId.toString()}`);
        
        // Save deployment info
        const deployInfo = {
            network: "testnet",
            fileId: fileId.toString(),
            contractId: contractId.toString(),
            address: contractId.toSolidityAddress(),
            deployedAt: new Date().toISOString(),
            platformWallet: platformWallet
        };
        
        fs.writeFileSync(
            path.resolve(__dirname, "../deployments/MemeAmmRouter_Deployed.json"),
            JSON.stringify(deployInfo, null, 2)
        );
        
        console.log(`\n💾 Deployment info saved to deployments/MemeAmmRouter_Deployed.json`);
        console.log(`\n⚠️ NOTE: It may take a few minutes for the contract to be fully accessible on Hedera.`);
        
    } catch (error) {
        console.error("\n❌ Deployment failed with error:");
        console.error(error);
        
        if (error.status) {
            console.log("\nHedera Status Code:", error.status);
        }
        
        if (error.message) {
            console.log("\nError Message:", error.message);
        }
    }
    
    client.close();
}

main();
