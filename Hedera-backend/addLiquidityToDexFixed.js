const { ethers } = require('ethers');
const {
    Client,
    PrivateKey,
    AccountId,
    TransferTransaction,
    TokenAssociateTransaction
} = require('@hashgraph/sdk');
require('dotenv').config();

// Configuration - same as server.js
const HASHIO_RPC_URL = process.env.HASHIO_RPC_URL || "https://testnet.hashio.io/api";
const SAUCERSWAP_ROUTER = process.env.SAUCERSWAP_ROUTER;
const LIQUIDITY_LOCKER = process.env.LIQUIDITY_LOCKER_ADDRESS;
const EVM_PRIVATE_KEY = process.env.OPERATOR_EVM_KEY;
const OPERATOR_ID = AccountId.fromString(process.env.OPERATOR_ID);
const OPERATOR_KEY = PrivateKey.fromString(process.env.OPERATOR_KEY);
const NETWORK = process.env.HEDERA_NETWORK || "testnet";

// Setup ethers provider and wallet
const provider = new ethers.JsonRpcProvider(HASHIO_RPC_URL);
const wallet = new ethers.Wallet(EVM_PRIVATE_KEY, provider);

// Setup Hedera client
function getHederaClient() {
    const client = NETWORK === "mainnet" ? Client.forMainnet() : Client.forTestnet();
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);
    return client;
}

// SaucerSwap router ABI
const routerAbi = [
  "function addLiquidityETH(address token,uint amountTokenDesired,uint amountTokenMin,uint amountHBARMin,address to,uint deadline) payable returns(uint amountToken,uint amountHBAR,uint liquidity)",
  "function WETH() view returns (address)"
];

// Token ABI for approvals
const tokenAbi = ["function approve(address spender,uint256 amount) external returns(bool)"];

let routerContract;
if (SAUCERSWAP_ROUTER) {
  try {
    const checksumAddress = ethers.getAddress(SAUCERSWAP_ROUTER.toLowerCase());
    routerContract = new ethers.Contract(checksumAddress, routerAbi, wallet);
    console.log('✅ Router contract initialized');
  } catch (error) {
    console.error('❌ Invalid SAUCERSWAP_ROUTER address:', SAUCERSWAP_ROUTER);
    process.exit(1);
  }
} else {
  console.error('❌ SAUCERSWAP_ROUTER not configured in environment');
  process.exit(1);
}

// Function to convert Hedera token ID to EVM address
function hederaTokenIdToEvmAddress(tokenId) {
  // Parse token ID like "0.0.6491863"
  const parts = tokenId.split('.');
  const tokenNum = parseInt(parts[2]);
  
  // Convert to hex and pad to 40 characters (20 bytes)
  const hex = tokenNum.toString(16).padStart(40, '0');
  return `0x${hex}`;
}

// Function to convert EVM address to Hedera token ID  
function evmAddressToHederaTokenId(evmAddress) {
  // Remove 0x prefix and convert to number
  const hex = evmAddress.replace('0x', '');
  const tokenNum = parseInt(hex, 16);
  return `0.0.${tokenNum}`;
}

// Fixed liquidity addition function that handles Hedera→EVM transfer
async function addInitialLiquidityFixed(tokenIdOrAddress, amountTokens) {
  if (!routerContract) throw new Error("Router not configured");
  
  console.log('\n🔧 Preparing liquidity addition...');
  console.log(`📍 Token: ${tokenIdOrAddress}`);
  console.log(`🪙 Token Amount: ${amountTokens}`);
  
  // Determine if input is Hedera ID or EVM address
  let tokenId, tokenAddress;
  if (tokenIdOrAddress.startsWith('0.0.')) {
    tokenId = tokenIdOrAddress;
    tokenAddress = hederaTokenIdToEvmAddress(tokenId);
  } else if (tokenIdOrAddress.startsWith('0x')) {
    tokenAddress = tokenIdOrAddress;
    tokenId = evmAddressToHederaTokenId(tokenAddress);
  } else {
    throw new Error('Invalid token format. Use either Hedera ID (0.0.123456) or EVM address (0x...)');
  }
  
  console.log(`🔗 Hedera Token ID: ${tokenId}`);
  console.log(`🔗 EVM Address: ${tokenAddress}`);
  
  // Get EVM wallet address from private key
  const evmWalletAddress = wallet.address;
  console.log(`👛 EVM Wallet: ${evmWalletAddress}`);
  
  // Fix address checksum issues
  const checksumRouterAddress = ethers.getAddress(SAUCERSWAP_ROUTER.toLowerCase());
  const checksumTokenAddress = ethers.getAddress(tokenAddress.toLowerCase());
  const checksumLiquidityLocker = ethers.getAddress(LIQUIDITY_LOCKER.toLowerCase());
  
  console.log(`✅ Router Address: ${checksumRouterAddress}`);
  console.log(`✅ Token Address: ${checksumTokenAddress}`);
  console.log(`✅ Liquidity Locker: ${checksumLiquidityLocker}`);
  
  // Step 1: Associate token with EVM wallet (if not already associated)
  console.log('\n🔗 Step 1: Associating token with EVM wallet...');
  const client = getHederaClient();
  
  try {
    const associateTx = new TokenAssociateTransaction()
      .setAccountId(evmWalletAddress)
      .setTokenIds([tokenId])
      .freezeWith(client);
    
    const signedAssociateTx = await associateTx.sign(OPERATOR_KEY);
    const associateResult = await signedAssociateTx.execute(client);
    const associateReceipt = await associateResult.getReceipt(client);
    
    console.log('✅ Token associated with EVM wallet');
    console.log(`📋 Associate Transaction: ${associateResult.transactionId.toString()}`);
  } catch (associateError) {
    // Association might already exist, check if it's a "TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT" error
    if (associateError.status && associateError.status.toString() === 'TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT') {
      console.log('✅ Token already associated with EVM wallet');
    } else {
      console.error('❌ Token association failed:', associateError.message);
      throw new Error(`Failed to associate token with EVM wallet: ${associateError.message}`);
    }
  }
  
  // Step 2: Transfer tokens from Hedera account to EVM wallet
  console.log('\n🔄 Step 2: Transferring tokens from Hedera account to EVM wallet...');
  
  try {
    const transferTx = new TransferTransaction()
      .addTokenTransfer(tokenId, OPERATOR_ID, (-BigInt(amountTokens)).toString())
      .addTokenTransfer(tokenId, evmWalletAddress, amountTokens)
      .freezeWith(client);
    
    const signedTransferTx = await transferTx.sign(OPERATOR_KEY);
    const transferResult = await signedTransferTx.execute(client);
    const transferReceipt = await transferResult.getReceipt(client);
    
    console.log('✅ Tokens transferred to EVM wallet');
    console.log(`📋 Transfer Transaction: ${transferResult.transactionId.toString()}`);
  } catch (transferError) {
    console.error('❌ Token transfer failed:', transferError.message);
    throw new Error(`Failed to transfer tokens to EVM wallet: ${transferError.message}`);
  }
  
  // Step 3: Approve router to spend tokens from EVM wallet
  console.log('\n📝 Step 3: Approving router to spend tokens...');
  const tokenContract = new ethers.Contract(checksumTokenAddress, tokenAbi, wallet);
  
  try {
    const approveTx = await tokenContract.approve(checksumRouterAddress, amountTokens);
    const approveReceipt = await approveTx.wait();
    console.log('✅ Approval confirmed');
    console.log(`📋 Approve Transaction: ${approveReceipt.hash}`);
  } catch (approveError) {
    console.error('❌ Approval failed:', approveError.message);
    throw new Error(`Failed to approve router: ${approveError.message}`);
  }
  
  // Step 4: Add liquidity to SaucerSwap
  console.log('\n💧 Step 4: Adding liquidity to SaucerSwap...');
  
  const amountTokensBN = BigInt(amountTokens);
  const amountMin = (amountTokensBN * 95n) / 100n; // 5% slippage tolerance
  const deadline = Math.floor(Date.now()/1000) + 3600;
  const hbarAmount = ethers.parseUnits("100", 18); // 100 HBAR for liquidity
  
  console.log(`🪙 Token Amount: ${amountTokens}`);
  console.log(`🪙 Min Token Amount: ${amountMin.toString()}`);
  console.log(`💎 HBAR Amount: 100 HBAR`);
  console.log(`💎 Min HBAR Amount: 95 HBAR`);
  console.log(`⏰ Deadline: ${new Date(deadline * 1000).toISOString()}`);
  
  try {
    const tx = await routerContract.addLiquidityETH(
      checksumTokenAddress,
      amountTokens,
      amountMin.toString(),
      ethers.parseUnits("95", 18), // Min HBAR amount (5% slippage)
      checksumLiquidityLocker,
      deadline,
      { value: hbarAmount }
    );
    
    console.log('⏳ Transaction submitted, waiting for confirmation...');
    const receipt = await tx.wait();
    console.log('✅ Liquidity addition confirmed!');
    console.log(`📋 Transaction Hash: ${receipt.hash}`);
    
    return receipt;
  } catch (liquidityError) {
    console.error('❌ Liquidity addition failed:', liquidityError.message);
    throw new Error(`Failed to add liquidity: ${liquidityError.message}`);
  }
}

// Main function to add liquidity for existing token
async function addLiquidityForToken(tokenIdOrAddress, tokenAmount) {
  try {
    console.log('\n🚀 Adding Liquidity to DEX for Existing Token (FIXED VERSION)');
    console.log('━'.repeat(70));
    console.log(`📍 Token: ${tokenIdOrAddress}`);
    console.log(`🪙 Token Amount: ${tokenAmount}`);
    console.log(`💎 HBAR Amount: 100 HBAR`);
    console.log(`🔧 Method: Hedera→EVM transfer + DEX liquidity`);
    console.log('━'.repeat(70));
    
    // Validate inputs
    if (!tokenIdOrAddress || (!tokenIdOrAddress.startsWith('0.0.') && !tokenIdOrAddress.startsWith('0x'))) {
      throw new Error('Invalid token. Use Hedera ID (0.0.123456) or EVM address (0x...)');
    }
    
    if (!tokenAmount || tokenAmount === '0') {
      throw new Error('Invalid token amount. Must be greater than 0');
    }
    
    // Add liquidity with proper token handling
    const receipt = await addInitialLiquidityFixed(tokenIdOrAddress, tokenAmount);
    
    console.log('\n🎉 SUCCESS! Liquidity added to SaucerSwap');
    console.log('━'.repeat(70));
    console.log(`📋 Transaction Hash: ${receipt.hash}`);
    console.log(`🌐 View on HashScan: https://hashscan.io/testnet/transaction/${receipt.hash}`);
    console.log(`💱 Your token is now tradeable on SaucerSwap!`);
    console.log('━'.repeat(70));
    
  } catch (error) {
    console.error('\n❌ FAILED to add liquidity:', error.message);
    console.error('━'.repeat(70));
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('\n🚀 Add Liquidity to DEX (FIXED) - Usage:');
    console.log('━'.repeat(70));
    console.log('node addLiquidityToDexFixed.js <TOKEN_ID_OR_ADDRESS> <TOKEN_AMOUNT>');
    console.log('\nExamples:');
    console.log('# Using Hedera Token ID:');
    console.log('node addLiquidityToDexFixed.js 0.0.6491863 9000000000000000');
    console.log('\n# Using EVM Address:');
    console.log('node addLiquidityToDexFixed.js 0x0000000000000000000000000000000000630ed7 9000000000000000');
    console.log('\nNote:');
    console.log('- TOKEN_ID_OR_ADDRESS: Hedera ID (0.0.123456) OR EVM address (0x...)');
    console.log('- TOKEN_AMOUNT: Amount of tokens to add (with decimals included)');
    console.log('- Script will transfer tokens from Hedera account to EVM wallet first');
    console.log('- Then approve and add 100 HBAR + tokens as liquidity');
    console.log('━'.repeat(70));
    process.exit(1);
  }
  
  const tokenIdOrAddress = args[0];
  const tokenAmount = args[1];
  
  // Run the liquidity addition
  addLiquidityForToken(tokenIdOrAddress, tokenAmount)
    .then(() => {
      console.log('\n✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error.message);
      process.exit(1);
    });
}

// Export for use in other scripts
module.exports = {
  addInitialLiquidityFixed,
  addLiquidityForToken,
  hederaTokenIdToEvmAddress,
  evmAddressToHederaTokenId
};
