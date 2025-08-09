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
    console.log("🚀 Deploying MemeAmmRouter to Hedera using pure Hedera SDK...");

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
    
    try {
        // Check if bytecode file exists
        if (fs.existsSync(bytecodePath)) {
            bytecode = fs.readFileSync(bytecodePath, "utf8").trim();
            console.log("✅ Loaded bytecode from file");
        } else {
            // If no file, use inline bytecode (you would replace this with your actual bytecode)
            bytecode = "PASTE_YOUR_BYTECODE_HERE";
            console.log("⚠️ Using inline bytecode");
        }
        
        // Check if ABI file exists
        if (fs.existsSync(abiPath)) {
            abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
            console.log("✅ Loaded ABI from file");
        } else {
            // If no file, use inline ABI (you would replace this with your actual ABI)
            abi = []; // PASTE_YOUR_ABI_HERE
            console.log("⚠️ Using inline ABI");
        }
    } catch (error) {
        console.error("❌ Error loading bytecode or ABI:", error.message);
        process.exit(1);
    }
    
    console.log(`📝 Bytecode length: ${bytecode.length / 2} bytes`);
    
    // Save ABI for later use
    fs.writeFileSync(
        path.resolve(__dirname, "../deployments/MemeAmmRouter_abi.json"),
        JSON.stringify(abi, null, 2)
    );

    try {
        // 4. Store the bytecode on Hedera File Service
        console.log("📂 Creating file for contract bytecode...");
        
        // Convert hex string to bytes if needed
        const bytecodeBuffer = bytecode.startsWith("0x") 
            ? Buffer.from(bytecode.substring(2), "hex") 
            : Buffer.from(bytecode, "hex");
        
        console.log(`📝 Bytecode length: ${bytecodeBuffer.length} bytes`);
        
        // Create file with bytecode
        const fileCreateTx = new FileCreateTransaction()
            .setKeys([operatorKey])
            .setContents(bytecodeBuffer)
            .freezeWith(client);
            
        const fileCreateSign = await fileCreateTx.sign(operatorKey);
        const fileCreateSubmit = await fileCreateSign.execute(client);
        const fileCreateRx = await fileCreateSubmit.getReceipt(client);
        const bytecodeFileId = fileCreateRx.fileId;
        
        console.log(`✅ Contract bytecode file created: ${bytecodeFileId.toString()}`);

        // 5. Deploy the contract
        console.log("🔨 Creating contract from bytecode file...");
        
        // Format platform wallet address for parameter (remove 0x if present)
        const formattedWallet = platformWallet.startsWith("0x") 
            ? platformWallet.substring(2)
            : platformWallet;
            
        // Prepare constructor parameters
        const constructorParams = new ContractFunctionParameters()
            .addAddress(formattedWallet);
            
        // Create contract
        const contractCreateTx = new ContractCreateTransaction()
            .setBytecodeFileId(bytecodeFileId)
            .setGas(3000000)
            .setConstructorParameters(constructorParams)
            .freezeWith(client);
            
        const contractCreateSign = await contractCreateTx.sign(operatorKey);
        const contractCreateSubmit = await contractCreateSign.execute(client);
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

    } catch (error) {
        console.error(`\n❌ Deployment failed:`);
        console.error(error.message);
        
        if (error.status && error.status._code) {
            console.log(`\n💡 Hedera Error Code: ${error.status._code}`);
            
            // Common Hedera error codes and solutions
            const errorCodes = {
                7: "INSUFFICIENT_PAYER_BALANCE - Add more HBAR to your account",
                10: "INVALID_CONTRACT_ID - The contract ID format is incorrect",
                11: "INVALID_TRANSACTION - The transaction is invalid, check parameters",
                21: "INVALID_SIGNATURE - Check your private key",
                82: "ERROR_DECODING_BYTESTRING - Try different parameter format"
            };
            
            if (errorCodes[error.status._code]) {
                console.log(`💡 Error meaning: ${errorCodes[error.status._code]}`);
            }
        }
    }
    
    client.close();
}

main();
