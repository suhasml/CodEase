require('dotenv').config();
const {
	Client,
	PrivateKey,
	AccountId,
	ContractCreateFlow,
} = require("@hashgraph/sdk");
const { ethers } = require("ethers");

// Paste & prefix your bytecode:
const CONTRACT_BYTECODE = ""; 



const PLATFORM_FEE_WALLET = "0x5010dd2c3f7e05b8b6e2c272a6bd2dc095afab2c"
const GAS_LIMIT = 3000000;           // Tune as needed
const INITIAL_BALANCE = 500;           // Optional

const HEDERA_ACCOUNT_ID="0.0.6471317"
const HEDERA_PRIVATE_KEY="0x14103fb57b18e3502675d620021b47f609935252479f7cfc46ce38925920feec"
const PLATFORM_FEE_WALLET_ADDRESS="0x5010dd2c3f7e05b8b6e2c272a6bd2dc095afab2c"


async function main() {
	const myAccountId = AccountId.fromString(HEDERA_ACCOUNT_ID);
const myPrivateKey = PrivateKey.fromStringECDSA(HEDERA_PRIVATE_KEY);
	const client = Client.forTestnet().setOperator(myAccountId, myPrivateKey);

	// Encode constructor args (just one address here, add more if needed)
	const abiCoder = new ethers.AbiCoder();
	const constructorParams = abiCoder.encode(["address"], [PLATFORM_FEE_WALLET_ADDRESS]);

	const contractCreate = new ContractCreateFlow()
		.setGas(GAS_LIMIT)
		.setBytecode(CONTRACT_BYTECODE)
		.setConstructorParameters(constructorParams)
		.setInitialBalance(INITIAL_BALANCE);

	const txResponse = await contractCreate.execute(client);
	const receipt = await txResponse.getReceipt(client);

	// Fetch and print the transaction record for error details
	const txRecord = await txResponse.getRecord(client);
	console.log("Contract creation record:", txRecord);

	const contractId = receipt.contractId;
	console.log("\n=== Contract Deployment Complete ===");
	console.log("Contract ID:", contractId.toString());
	console.log("Solidity Address:", contractId.toSolidityAddress());

	client.close();
}

main().catch(err => {
	console.error("Deployment error:", err);
});
