const { 
    Client, 
    PrivateKey, 
    AccountId,
    FileCreateTransaction,
    FileAppendTransaction, 
    ContractCreateTransaction,
    ContractFunctionParameters,
    Hbar
} = require("@hashgraph/sdk");
require("dotenv").config();

async function main() {
    console.log("🚀 Deploying MemeAmmRouter to Hedera using pure Hedera SDK (DEBUG MODE)...");

    // 1. Validate environment
    if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_ACCOUNT_PRIVATE_KEY) {
        console.error("❌ Environment variables HEDERA_ACCOUNT_ID and HEDERA_ACCOUNT_PRIVATE_KEY must be present");
        return;
    }

    // 2. Setup Hedera client
    const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    const operatorKey = PrivateKey.fromString(process.env.HEDERA_ACCOUNT_PRIVATE_KEY);
    const platformWallet = process.env.PLATFORM_FEE_WALLET;

    const client = Client.forTestnet();
    client.setOperator(operatorId, operatorKey);

    console.log(`📊 Using Hedera account: ${operatorId.toString()}`);
    console.log(`🏦 Platform fee wallet: ${platformWallet}`);
    
    // 3. Use provided bytecode and ABI
    console.log("📝 Loading bytecode and ABI...");
    const fs = require("fs");
    const path = require("path");
    
    // Load bytecode and ABI from files
    const bytecodePath = path.resolve(__dirname, "../deployments/MemeAmmRouter_bytecode.txt");
    const abiPath = path.resolve(__dirname, "../deployments/MemeAmmRouter_abi.json");
    
    let bytecode, abi;
    
    // Check if bytecode file exists
    if (fs.existsSync(bytecodePath)) {
        bytecode = fs.readFileSync(bytecodePath, "utf8").trim();
        console.log("✅ Loaded bytecode from file");
    } else {
        console.error("❌ Bytecode file not found. Please create a file at deployments/MemeAmmRouter_bytecode.txt");
        process.exit(1);
    }
    
    // Check if ABI file exists
    if (fs.existsSync(abiPath)) {
        abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
        console.log("✅ Loaded ABI from file");
    } else {
        console.error("❌ ABI file not found. Please create a file at deployments/MemeAmmRouter_abi.json");
        process.exit(1);
    }
    
    console.log(`📝 Bytecode length: ${bytecode.length / 2} bytes`);
    
    // 4. Store the bytecode on Hedera File Service
    console.log("📂 Creating file for contract bytecode...");
    
    // Convert hex string to bytes if needed
    const bytecodeBuffer = bytecode.startsWith("0x") 
        ? Buffer.from(bytecode.substring(2), "hex") 
        : Buffer.from(bytecode, "hex");
    
    console.log(`📝 Bytecode length: ${bytecodeBuffer.length} bytes`);
    
    // Create file with bytecode - with detailed logging
    console.log("🔄 Creating FileCreateTransaction...");
    const fileCreateTx = new FileCreateTransaction()
        .setKeys([operatorKey])
        .setContents(bytecodeBuffer)
        .setMaxTransactionFee(new Hbar(10)) // Increase max fee
        .freezeWith(client);
        
    console.log("🔄 Signing transaction...");
    const fileCreateSign = await fileCreateTx.sign(operatorKey);
    
    console.log("🔄 Executing transaction...");
    const fileCreateSubmit = await fileCreateSign.execute(client);
    console.log(`🔄 Transaction ID: ${fileCreateSubmit.transactionId.toString()}`);
    
    console.log("🔄 Waiting for receipt...");
    const fileCreateRx = await fileCreateSubmit.getReceipt(client);
    
    const bytecodeFileId = fileCreateRx.fileId;
    console.log(`✅ Contract bytecode file created: ${bytecodeFileId.toString()}`);

    // 5. Deploy the contract
    console.log("🔨 Creating contract from bytecode file...");
    
    // Format platform wallet address for parameter (remove 0x if present)
    const formattedWallet = platformWallet.startsWith("0x") 
        ? platformWallet.substring(2)
        : platformWallet;
        
    console.log(`🔄 Using wallet address: ${formattedWallet}`);
        
    // Prepare constructor parameters
    console.log("🔄 Preparing constructor parameters...");
    const constructorParams = new ContractFunctionParameters()
        .addAddress(formattedWallet);
        
    // Create contract with more detailed logging
    console.log("🔄 Creating ContractCreateTransaction...");
    const contractCreateTx = new ContractCreateTransaction()
        .setBytecodeFileId(bytecodeFileId)
        .setGas(4000000) // Increase gas limit
        .setMaxTransactionFee(new Hbar(40)) // Increase max fee
        .setConstructorParameters(constructorParams)
        .freezeWith(client);
        
    console.log("🔄 Signing contract transaction...");
    const contractCreateSign = await contractCreateTx.sign(operatorKey);
    
    console.log("🔄 Executing contract transaction...");
    const contractCreateSubmit = await contractCreateSign.execute(client);
    console.log(`🔄 Contract Transaction ID: ${contractCreateSubmit.transactionId.toString()}`);
    
    console.log("🔄 Waiting for contract receipt...");
    const contractCreateRx = await contractCreateSubmit.getReceipt(client);
    const contractId = contractCreateRx.contractId;
    
    console.log(`\n✅ Contract deployed successfully!`);
    console.log(`📋 Contract ID: ${contractId.toString()}`);
    console.log(`📋 Contract Solidity Address: ${contractId.toSolidityAddress()}`);
    console.log(`🔗 View on HashScan: https://hashscan.io/testnet/contract/${contractId.toString()}`);
    
    // Save info to a file
    const deploymentPath = path.resolve(__dirname, "../deployments");
    if (!fs.existsSync(deploymentPath)) {
        fs.mkdirSync(deploymentPath, { recursive: true });
    }
    
    const deploymentInfo = {
        contractId: contractId.toString(),
        contractAddress: contractId.toSolidityAddress(),
        deployedAt: new Date().toISOString(),
        platformWallet: platformWallet,
        abi: abi
    };
    
    fs.writeFileSync(
        path.resolve(deploymentPath, "MemeAmmRouter_Hedera_SDK.json"), 
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log(`\n💾 Deployment info saved to deployments/MemeAmmRouter_Hedera_SDK.json`);
    
    client.close();
}

// Run the main function
main().catch((error) => {
    console.error("\n❌ Uncaught error in deployment:");
    console.error(error);
    
    // Print detailed error information
    if (error.status) {
        console.log(`\n💡 Status: ${JSON.stringify(error.status, null, 2)}`);
    }
    
    if (error.transactionId) {
        console.log(`\n💡 Transaction ID: ${error.transactionId.toString()}`);
    }
    
    if (error.stack) {
        console.log(`\n💡 Stack trace: ${error.stack}`);
    }
    
    process.exit(1);
});
