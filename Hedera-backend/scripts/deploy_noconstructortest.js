// const fs = require("fs");
// const {
//     Client,
//     PrivateKey,
//     AccountId,
//     ContractCreateFlow,
// } = require("@hashgraph/sdk");

// // Hardcoded values
// const HEDERA_ACCOUNT_ID = "0.0.6471317";
// const HEDERA_PRIVATE_KEY = "0x14103fb57b18e3502675d620021b47f609935252479f7cfc46ce38925920feec";
// const GAS_LIMIT = 500000;
// const INITIAL_BALANCE = 0;

// async function main() {
//     // Read the compiled contract bytecode
//     const contractBytecode = fs.readFileSync("NoConstructorTest.bin").toString().trim();
//     // Debug logs for bytecode
//     console.log("[DEBUG] Bytecode length:", contractBytecode.length);
//     console.log("[DEBUG] Bytecode first 40 chars:", contractBytecode.slice(0, 40));
//     console.log("[DEBUG] Bytecode last 40 chars:", contractBytecode.slice(-40));
//     console.log("[DEBUG] Expected Solidity version: ^0.8.20");

//     // Set up Hedera client
//     const myAccountId = AccountId.fromString(HEDERA_ACCOUNT_ID);
//     const myPrivateKey = PrivateKey.fromStringECDSA(HEDERA_PRIVATE_KEY);
//     const client = Client.forTestnet().setOperator(myAccountId, myPrivateKey);

//     // Instantiate the smart contract (no constructor params)
//     const contractInstantiateTx = new ContractCreateFlow()
//         .setBytecode(contractBytecode)
//         .setGas(GAS_LIMIT)
//         .setInitialBalance(INITIAL_BALANCE);
//     const contractInstantiateSubmit = await contractInstantiateTx.execute(client);
//     const contractInstantiateRx = await contractInstantiateSubmit.getReceipt(client);
//     const contractId = contractInstantiateRx.contractId;
//     const contractAddress = contractId.toSolidityAddress();
//     console.log(`- The smart contract ID is: ${contractId}`);
//     console.log(`- The smart contract ID in Solidity format is: ${contractAddress}`);

//     client.close();
// }
// main().catch(err => {
//     console.error("Deployment error:", err);
// });


const fs = require("fs");
const {
    Client,
    PrivateKey,
    AccountId,
    ContractCreateFlow,
    ContractFunctionParameters,
} = require("@hashgraph/sdk");

// Hardcoded values - Updated with checksummed address
const HEDERA_ACCOUNT_ID = "0.0.6471317";
const HEDERA_PRIVATE_KEY = "0x14103fb57b18e3502675d620021b47f609935252479f7cfc46ce38925920feec";
const PLATFORM_FEE_WALLET_ADDRESS = "0x5010Dd2C3f7E05B8b6E2C272A6BD2DC095AFAb2c"; // Checksummed address
const GAS_LIMIT = 5000000;
const INITIAL_BALANCE = 700;

async function main() {
    console.log("🚀 Starting MemeAmmRouter deployment...\n");
    
    // Read the compiled contract bytecode
    const contractBytecode = fs.readFileSync("MemeAmmRouter.bin").toString().trim();
    
    // Debug logs for bytecode
    console.log("[DEBUG] Bytecode length:", contractBytecode.length);
    console.log("[DEBUG] Bytecode first 40 chars:", contractBytecode.slice(0, 40));
    console.log("[DEBUG] Bytecode last 40 chars:", contractBytecode.slice(-40));
    console.log("[DEBUG] Expected Solidity version: ^0.8.20");
    console.log("[DEBUG] Platform wallet (checksummed):", PLATFORM_FEE_WALLET_ADDRESS);
    console.log("[DEBUG] Gas limit:", GAS_LIMIT);
    console.log("[DEBUG] Initial balance:", INITIAL_BALANCE, "tinybars\n");

    // Set up Hedera client
    const myAccountId = AccountId.fromString(HEDERA_ACCOUNT_ID);
    const myPrivateKey = PrivateKey.fromStringECDSA(HEDERA_PRIVATE_KEY);
    const client = Client.forTestnet().setOperator(myAccountId, myPrivateKey);

    // Validate the address parameter
    let addressParam = PLATFORM_FEE_WALLET_ADDRESS;
    if (!addressParam.startsWith("0x")) {
        addressParam = "0x" + addressParam;
    }
    if (addressParam.length !== 42) {
        console.error("[ERROR] PLATFORM_FEE_WALLET_ADDRESS is not a valid 20-byte hex address:", addressParam);
        return;
    }

    console.log("📝 Constructor parameters:");
    console.log("  - initialOwner:", addressParam);
    console.log("");

    try {
        // Instantiate the smart contract with constructor parameters
        console.log("🔨 Creating contract transaction...");
        const contractInstantiateTx = new ContractCreateFlow()
            .setBytecode(contractBytecode)
            .setConstructorParameters(
                new ContractFunctionParameters()
                    .addAddress(addressParam)
            )
            .setGas(GAS_LIMIT)
            .setInitialBalance(INITIAL_BALANCE);

        console.log("📤 Submitting contract creation transaction...");
        const contractInstantiateSubmit = await contractInstantiateTx.execute(client);
        
        console.log("⏳ Waiting for transaction receipt...");
        const contractInstantiateRx = await contractInstantiateSubmit.getReceipt(client);
        
        const contractId = contractInstantiateRx.contractId;
        const contractAddress = contractId.toSolidityAddress();
        
        console.log("\n✅ CONTRACT DEPLOYED SUCCESSFULLY!");
        console.log("==========================================");
        console.log(`📋 Contract ID: ${contractId}`);
        console.log(`📄 Contract Address: ${contractAddress}`);
        console.log(`👤 Owner: ${addressParam}`);
        console.log(`💰 Initial Balance: ${INITIAL_BALANCE} tinybars`);
        console.log(`⛽ Gas Used: ${GAS_LIMIT} (limit)`);
        console.log("==========================================\n");

        // Verify deployment
        console.log("🔍 Deployment verification:");
        console.log(`  - Transaction ID: ${contractInstantiateSubmit.transactionId}`);
        console.log(`  - Network: Hedera Testnet`);
        console.log(`  - Status: ${contractInstantiateRx.status}`);
        
    } catch (error) {
        console.error("\n❌ DEPLOYMENT FAILED!");
        console.error("==========================================");
        console.error("Error details:", error);
        
        if (error.message) {
            console.error("Error message:", error.message);
        }
        
        if (error.status) {
            console.error("Transaction status:", error.status);
        }
        
        console.error("==========================================");
        
        // Common troubleshooting tips
        console.log("\n🔧 Troubleshooting tips:");
        console.log("1. Ensure your account has sufficient HBAR balance");
        console.log("2. Check that the bytecode file 'MemeAmmRouter.bin' exists");
        console.log("3. Verify OpenZeppelin contracts are properly imported");
        console.log("4. Make sure the address is properly checksummed");
        console.log("5. Try increasing the gas limit if needed");
    }

    client.close();
}

// Run the deployment
main().catch(err => {
    console.error("Deployment script error:", err);
    process.exit(1);
});