const { ethers } = require('ethers');
const {
  Status,
  ContractId,
  TokenAssociateTransaction,
  AccountBalanceQuery,
  AccountAllowanceApproveTransaction,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
} = require('@hashgraph/sdk');

const {
  NETWORK,
  OPERATOR_ID,
  OPERATOR_KEY,
  getHederaClient,
  PLATFORM_CONFIG,
  HELISWAP_CONFIG,
  heliswapFactory,
} = require('../config');

async function addInitialLiquidityWithHeliSwap(tokenAddress, liquidityPortion, decimals, _creatorWallet) {
  const client = getHederaClient();
  const tokenIdFromAddress = tokenAddress.slice(2);
  const tokenIdNum = parseInt(tokenIdFromAddress, 16);
  const tokenId = `0.0.${tokenIdNum}`;

  try {
    // Associate token with operator
    try {
      const associateTx = await new TokenAssociateTransaction()
        .setAccountId(OPERATOR_ID)
        .setTokenIds([tokenId])
        .freezeWith(client);
      const signedAssociateTx = await associateTx.sign(OPERATOR_KEY);
      await signedAssociateTx.execute(client);
    } catch (err) {
      if (!String(err.message).includes('TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT')) throw err;
    }

    // Check balance
    const accountBalance = await new AccountBalanceQuery().setAccountId(OPERATOR_ID).execute(client);
    const tokenBalance = accountBalance.tokens.get(tokenId);
    if (!tokenBalance || tokenBalance < liquidityPortion) {
      throw new Error(`Insufficient balance. Need ${liquidityPortion.toString()}, have ${tokenBalance ? tokenBalance.toString() : '0'}`);
    }

    // Approve router to spend tokens
    const routerContractId = ContractId.fromString(HELISWAP_CONFIG.ROUTER.hedera_id);
    const approveTx = await new AccountAllowanceApproveTransaction()
      .approveTokenAllowance(tokenId, OPERATOR_ID, routerContractId, liquidityPortion.toString())
      .freezeWith(client);
    const signedApproveTx = await approveTx.sign(OPERATOR_KEY);
    await signedApproveTx.execute(client);

    // Add liquidity via router
    const liquidityHbar = PLATFORM_CONFIG.LIQUIDITY_HBAR[NETWORK] || 10;
    const hbarAmountTinybars = BigInt(liquidityHbar * 100000000);
    const hbarForMsgValue = Hbar.from(liquidityHbar);
    const tokenAmount = liquidityPortion;
    const deadline = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

    const operatorEvmAddress = `0x${OPERATOR_ID.toSolidityAddress()}`;

    const contractParams = new ContractFunctionParameters()
      .addAddress(tokenAddress)
      .addUint256(tokenAmount.toString())
      .addUint256(tokenAmount.toString())
      .addUint256(hbarAmountTinybars.toString())
      .addAddress(operatorEvmAddress)
      .addUint256(deadline);

    const contractTx = await new ContractExecuteTransaction()
      .setContractId(routerContractId)
      .setGas(10000000)
      .setPayableAmount(hbarForMsgValue)
      .setFunction('addLiquidityHBAR', contractParams)
      .freezeWith(client);

    const signedContractTx = await contractTx.sign(OPERATOR_KEY);
    const contractResponse = await signedContractTx.execute(client);
    const receipt = await contractResponse.getReceipt(client);

    if (receipt.status !== Status.Success) {
      throw new Error(`HeliSwap liquidity addition failed: ${receipt.status}`);
    }

    let pairAddress = '0x0000000000000000000000000000000000000000';
    try {
      pairAddress = await heliswapFactory.getPair(tokenAddress, HELISWAP_CONFIG.WHBAR.evm_address);
    } catch (_) {}

    return {
      success: true,
      transactionId: contractResponse.transactionId.toString(),
      pairAddress,
      poolDetails: {
        tokenAddress,
        whbarAddress: HELISWAP_CONFIG.WHBAR.evm_address,
        tokenAmount: tokenAmount.toString(),
        hbarAmount: liquidityHbar.toString(),
        pairContract: pairAddress,
        dexFee: '0.3%',
        liquidityTokens: tokenAmount.toString(),
      },
      contracts: {
        heliswapFactory: HELISWAP_CONFIG.FACTORY.evm_address,
        heliswapRouter: HELISWAP_CONFIG.ROUTER.evm_address,
        whbar: HELISWAP_CONFIG.WHBAR.evm_address,
        pairContract: pairAddress,
      },
      tradingUrl: 'https://app.heliswap.io',
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  addInitialLiquidityWithHeliSwap,
};


