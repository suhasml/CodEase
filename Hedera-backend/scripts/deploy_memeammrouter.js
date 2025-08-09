// const fs = require("fs");
// const {
//     Client,
//     PrivateKey,
//     AccountId,
//     ContractCreateFlow,
//     ContractFunctionParameters,
// } = require("@hashgraph/sdk");

// // Hardcoded values
// const HEDERA_ACCOUNT_ID = "0.0.6471317";
// const HEDERA_PRIVATE_KEY = "0x14103fb57b18e3502675d620021b47f609935252479f7cfc46ce38925920feec";
// const PLATFORM_FEE_WALLET_ADDRESS = "0x5010dd2c3f7e05b8b6e2c272a6bd2dc095afab2c";
// const GAS_LIMIT = 5000000;
// const INITIAL_BALANCE = 700;

// async function main() {
//     // Read the compiled contract bytecode
//     const contractBytecode = fs.readFileSync("MemAmmRouter.bin").toString().trim();
//     // Debug logs for bytecode
//     console.log("[DEBUG] Bytecode length:", contractBytecode.length);
//     console.log("[DEBUG] Bytecode first 40 chars:", contractBytecode.slice(0, 40));
//     console.log("[DEBUG] Bytecode last 40 chars:", contractBytecode.slice(-40));
//     // Solidity version info (should match your compiler)
//     console.log("[DEBUG] Expected Solidity version: ^0.8.20");

//     // Set up Hedera client
//     const myAccountId = AccountId.fromString(HEDERA_ACCOUNT_ID);
//     const myPrivateKey = PrivateKey.fromStringECDSA(HEDERA_PRIVATE_KEY);
//     const client = Client.forTestnet().setOperator(myAccountId, myPrivateKey);

//     // Validate and debug the address parameter
//     let addressParam = PLATFORM_FEE_WALLET_ADDRESS;
//     if (!addressParam.startsWith("0x")) {
//         addressParam = "0x" + addressParam;
//     }
//     if (addressParam.length !== 42) {
//         console.error("[ERROR] PLATFORM_FEE_WALLET_ADDRESS is not a valid 20-byte hex address:", addressParam);
//         return;
//     }
//     console.log("[DEBUG] Constructor address param:", addressParam);

//     // Instantiate the smart contract
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

// Test with checksummed address
const HEDERA_ACCOUNT_ID = "0.0.6471317";
const HEDERA_PRIVATE_KEY = "0x14103fb57b18e3502675d620021b47f609935252479f7cfc46ce38925920feec";
const PLATFORM_FEE_WALLET_ADDRESS = "0x5010Dd2C3f7E05B8b6E2C272A6BD2DC095AFAb2c";

async function testDeployment() {
    console.log("🧪 Testing minimal contract deployment...\n");
    
    try {
        // Read bytecode
        const contractBytecode = fs.readFileSync("MemeAmmRouter.bin").toString().trim();
        console.log("[DEBUG] Bytecode length:", contractBytecode.length);
        console.log("[DEBUG] Address:", PLATFORM_FEE_WALLET_ADDRESS);
        
        // Setup client
        const myAccountId = AccountId.fromString(HEDERA_ACCOUNT_ID);
        const myPrivateKey = PrivateKey.fromStringECDSA(HEDERA_PRIVATE_KEY);
        const client = Client.forTestnet().setOperator(myAccountId, myPrivateKey);
        
        // Test 1: Try with higher gas limit
        console.log("🧪 Test 1: High gas limit (4M)");
        try {
            const tx1 = new ContractCreateFlow()
                .setBytecode(contractBytecode)
                .setConstructorParameters(
                    new ContractFunctionParameters()
                        .addAddress(PLATFORM_FEE_WALLET_ADDRESS)
                )
                .setGas(4000000)
                .setInitialBalance(100);
            
            const submit1 = await tx1.execute(client);
            const receipt1 = await submit1.getReceipt(client);
            
            console.log("✅ SUCCESS with high gas!");
            console.log("Contract ID:", receipt1.contractId.toString());
            console.log("Contract Address:", receipt1.contractId.toSolidityAddress());
            client.close();
            return;
            
        } catch (e) {
            console.log("❌ Failed with high gas:", e.message.split('\n')[0]);
        }
        
        // Test 2: Try without constructor parameters
        console.log("\n🧪 Test 2: No constructor (should fail, but let's see the error)");
        try {
            const tx2 = new ContractCreateFlow()
                .setBytecode(contractBytecode)
                .setGas(3000000)
                .setInitialBalance(100);
            
            const submit2 = await tx2.execute(client);
            const receipt2 = await submit2.getReceipt(client);
            
            console.log("✅ SUCCESS without constructor (unexpected!)");
            console.log("Contract ID:", receipt2.contractId.toString());
            
        } catch (e) {
            console.log("❌ Failed without constructor:", e.message.split('\n')[0]);
        }
        
        // Test 3: Try with different address format
        console.log("\n🧪 Test 3: Lowercase address");
        try {
            const tx3 = new ContractCreateFlow()
                .setBytecode(contractBytecode)
                .setConstructorParameters(
                    new ContractFunctionParameters()
                        .addAddress("0x5010dd2c3f7e05b8b6e2c272a6bd2dc095afab2c")
                )
                .setGas(3000000)
                .setInitialBalance(100);
            
            const submit3 = await tx3.execute(client);
            const receipt3 = await submit3.getReceipt(client);
            
            console.log("✅ SUCCESS with lowercase address!");
            console.log("Contract ID:", receipt3.contractId.toString());
            
        } catch (e) {
            console.log("❌ Failed with lowercase:", e.message.split('\n')[0]);
        }
        
        // Test 4: Try with zero address
        console.log("\n🧪 Test 4: Zero address (should fail)");
        try {
            const tx4 = new ContractCreateFlow()
                .setBytecode(contractBytecode)
                .setConstructorParameters(
                    new ContractFunctionParameters()
                        .addAddress("0x0000000000000000000000000000000000000000")
                )
                .setGas(3000000)
                .setInitialBalance(100);
            
            const submit4 = await tx4.execute(client);
            const receipt4 = await submit4.getReceipt(client);
            
            console.log("✅ SUCCESS with zero address (unexpected!)");
            
        } catch (e) {
            console.log("❌ Failed with zero address:", e.message.split('\n')[0]);
        }
        
        client.close();
        console.log("\n💡 All tests completed. Check which one succeeded.");
        
    } catch (error) {
        console.error("\n❌ Script error:", error.message);
    }
}

testDeployment();