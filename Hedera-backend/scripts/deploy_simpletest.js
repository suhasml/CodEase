const fs = require("fs");
const {
    Client,
    PrivateKey,
    AccountId,
    ContractCreateFlow,
    ContractFunctionParameters,
} = require("@hashgraph/sdk");

// Hardcoded values
const HEDERA_ACCOUNT_ID = "0.0.6471317";
const HEDERA_PRIVATE_KEY = "0x14103fb57b18e3502675d620021b47f609935252479f7cfc46ce38925920feec";
const OWNER_ADDRESS = "0x5010dd2c3f7e05b8b6e2c272a6bd2dc095afab2c";
const GAS_LIMIT = 1000000;
const INITIAL_BALANCE = 10;

async function main() {
    // Read the compiled contract bytecode
    const contractBytecode = fs.readFileSync("SimpleTest.bin").toString().trim();
    // Debug logs for bytecode
    console.log("[DEBUG] Bytecode length:", contractBytecode.length);
    console.log("[DEBUG] Bytecode first 40 chars:", contractBytecode.slice(0, 40));
    console.log("[DEBUG] Bytecode last 40 chars:", contractBytecode.slice(-40));
    console.log("[DEBUG] Expected Solidity version: ^0.8.20");

    // Set up Hedera client
    const myAccountId = AccountId.fromString(HEDERA_ACCOUNT_ID);
    const myPrivateKey = PrivateKey.fromStringECDSA(HEDERA_PRIVATE_KEY);
    const client = Client.forTestnet().setOperator(myAccountId, myPrivateKey);

    // Instantiate the smart contract
    const contractInstantiateTx = new ContractCreateFlow()
        .setBytecode(contractBytecode)
        .setGas(GAS_LIMIT)
        .setConstructorParameters(
            new ContractFunctionParameters().addAddress(OWNER_ADDRESS)
        )
        .setInitialBalance(INITIAL_BALANCE);
    const contractInstantiateSubmit = await contractInstantiateTx.execute(client);
    const contractInstantiateRx = await contractInstantiateSubmit.getReceipt(client);
    const contractId = contractInstantiateRx.contractId;
    const contractAddress = contractId.toSolidityAddress();
    console.log(`- The smart contract ID is: ${contractId}`);
    console.log(`- The smart contract ID in Solidity format is: ${contractAddress}`);

    client.close();
}
main().catch(err => {
    console.error("Deployment error:", err);
});
