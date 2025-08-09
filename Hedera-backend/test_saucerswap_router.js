const {
  Client,
  AccountId,
  PrivateKey,
  ContractCallQuery,
  ContractExecuteTransaction,
  ContractId,
  Hbar,
  ContractFunctionParameters
} = require('@hashgraph/sdk');
require('dotenv').config();

const SAUCERSWAP_ROUTER_ID = process.env.SAUCERSWAP_ROUTER || "0.0.1414040";
const OPERATOR_ID = process.env.OPERATOR_ID;
const OPERATOR_KEY = process.env.OPERATOR_KEY;
const NETWORK = process.env.NETWORK || "testnet";

// Use real values from your log
const tokenEvmAddress = "0x000000000000000000000000000000000063186B";
const liquidityLockerAddress = "0x99765b537798B1F57C7a064413621155465b8072";
const amountTokens = "9000000000000";
const amountTokenMin = "8550000000000";
const hbarLiquidityAmount = "10000000000"; // 100 HBAR in tinybars
const hbarMin = "9500000000"; // 95 HBAR in tinybars
const deadline = 1754159630; // from your log

async function main() {
  const client = NETWORK === "mainnet" ? Client.forMainnet() : Client.forTestnet();
  client.setOperator(AccountId.fromString(OPERATOR_ID), PrivateKey.fromString(OPERATOR_KEY));

  const contractId = ContractId.fromString(SAUCERSWAP_ROUTER_ID);

  const params = new ContractFunctionParameters()
    .addAddress(tokenEvmAddress)
    .addUint256(amountTokens)
    .addUint256(amountTokenMin)
    .addUint256(hbarMin)
    .addAddress(liquidityLockerAddress)
    .addUint256(deadline);

  const tx = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(350000)
    .setFunction("addLiquidityETHNewPool", params)
    .setPayableAmount(Hbar.fromTinybars(hbarLiquidityAmount));

  const signedTx = await tx.freezeWith(client).sign(PrivateKey.fromString(OPERATOR_KEY));
  const response = await signedTx.execute(client);
  const receipt = await response.getReceipt(client);
  console.log("Transaction status:", receipt.status.toString());
}

main();