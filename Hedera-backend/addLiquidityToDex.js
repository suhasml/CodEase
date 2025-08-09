const { ethers } = require('ethers');
require('dotenv').config();

// Configuration - same as server.js
const HASHIO_RPC_URL = process.env.HASHIO_RPC_URL || "https://testnet.hashio.io/api";
const SAUCERSWAP_ROUTER = process.env.SAUCERSWAP_ROUTER; // e.g. 0xCf5B8Cc7bC79cfA1465e93d74B740a3fC3d06cB9 (testnet)
const LIQUIDITY_LOCKER = process.env.LIQUIDITY_LOCKER_ADDRESS; // deployed LiquidityLocker contract
const EVM_PRIVATE_KEY = process.env.OPERATOR_EVM_KEY; // ECDSA key corresponding to OPERATOR_ID

// Setup ethers provider and wallet
const provider = new ethers.JsonRpcProvider(HASHIO_RPC_URL);
const wallet = new ethers.Wallet(EVM_PRIVATE_KEY, provider);

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
    // Convert to proper checksum address
    const checksumAddress = ethers.getAddress(SAUCERSWAP_ROUTER.toLowerCase());
    routerContract = new ethers.Contract(checksumAddress, routerAbi, wallet);
    console.log('✅ Router contract initialized');
  } catch (error) {
    console.error('❌ Invalid SAUCERSWAP_ROUTER address:', SAUCERSWAP_ROUTER);
    console.error('Please provide a valid Ethereum address');
    process.exit(1);
  }
} else {
  console.error('❌ SAUCERSWAP_ROUTER not configured in environment');
  process.exit(1);
}

// Same liquidity addition function as server.js
async function addInitialLiquidity(tokenAddress, amountTokens) {
  if (!routerContract) throw new Error("Router not configured");
  
  console.log('\n🔧 Preparing liquidity addition...');
  console.log(`📍 Token Address: ${tokenAddress}`);
  console.log(`🪙 Token Amount: ${amountTokens}`);
  
  // Fix address checksum issues
  const checksumRouterAddress = ethers.getAddress(SAUCERSWAP_ROUTER.toLowerCase());
  const checksumTokenAddress = ethers.getAddress(tokenAddress.toLowerCase());
  const checksumLiquidityLocker = ethers.getAddress(LIQUIDITY_LOCKER.toLowerCase());
  
  console.log(`✅ Router Address: ${checksumRouterAddress}`);
  console.log(`✅ Token Address: ${checksumTokenAddress}`);
  console.log(`✅ Liquidity Locker: ${checksumLiquidityLocker}`);
  
  const tokenContract = new ethers.Contract(checksumTokenAddress, tokenAbi, wallet);
  
  console.log('\n📝 Approving router to spend tokens...');
  const approveTx = await tokenContract.approve(checksumRouterAddress, amountTokens);
  await approveTx.wait();
  console.log('✅ Approval confirmed');
  
  // Use BigInt for ethers v6 instead of ethers.BigNumber
  const amountTokensBN = BigInt(amountTokens);
  const amountMin = (amountTokensBN * 95n) / 100n; // 5% slippage tolerance
  const deadline = Math.floor(Date.now()/1000) + 3600;
  const hbarAmount = ethers.parseUnits("100", 18); // 100 HBAR for liquidity
  
  console.log('\n💧 Adding liquidity to SaucerSwap...');
  console.log(`🪙 Token Amount: ${amountTokens}`);
  console.log(`🪙 Min Token Amount: ${amountMin.toString()}`);
  console.log(`💎 HBAR Amount: 100 HBAR`);
  console.log(`💎 Min HBAR Amount: 95 HBAR`);
  console.log(`⏰ Deadline: ${new Date(deadline * 1000).toISOString()}`);
  
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
}

// Main function to add liquidity for existing token
async function addLiquidityForToken(tokenAddress, tokenAmount) {
  try {
    console.log('\n🚀 Adding Liquidity to DEX for Existing Token');
    console.log('━'.repeat(60));
    console.log(`📍 Token Address: ${tokenAddress}`);
    console.log(`🪙 Token Amount: ${tokenAmount}`);
    console.log(`💎 HBAR Amount: 100 HBAR`);
    console.log('━'.repeat(60));
    
    // Validate inputs
    if (!tokenAddress || !tokenAddress.startsWith('0x')) {
      throw new Error('Invalid token address. Must be EVM format (0x...)');
    }
    
    if (!tokenAmount || tokenAmount === '0') {
      throw new Error('Invalid token amount. Must be greater than 0');
    }
    
    // Add liquidity
    const receipt = await addInitialLiquidity(tokenAddress, tokenAmount);
    
    console.log('\n🎉 SUCCESS! Liquidity added to SaucerSwap');
    console.log('━'.repeat(60));
    console.log(`📋 Transaction Hash: ${receipt.hash}`);
    console.log(`🌐 View on HashScan: https://hashscan.io/testnet/transaction/${receipt.hash}`);
    console.log(`💱 Your token is now tradeable on SaucerSwap!`);
    console.log('━'.repeat(60));
    
  } catch (error) {
    console.error('\n❌ FAILED to add liquidity:', error.message);
    console.error('━'.repeat(60));
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Command line usage
if (require.main === module) {
  // Get token address and amount from command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('\n🚀 Add Liquidity to DEX - Usage:');
    console.log('━'.repeat(60));
    console.log('node addLiquidityToDex.js <TOKEN_ADDRESS> <TOKEN_AMOUNT>');
    console.log('\nExample:');
    console.log('node addLiquidityToDex.js 0x0000000000000000000000000000000000630ed7 9000000000000000');
    console.log('\nNote:');
    console.log('- TOKEN_ADDRESS: EVM format (0x...) of your Hedera token');
    console.log('- TOKEN_AMOUNT: Amount of tokens to add (with decimals included)');
    console.log('- Script will add 100 HBAR as pair liquidity');
    console.log('━'.repeat(60));
    process.exit(1);
  }
  
  const tokenAddress = args[0];
  const tokenAmount = args[1];
  
  // Run the liquidity addition
  addLiquidityForToken(tokenAddress, tokenAmount)
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
  addInitialLiquidity,
  addLiquidityForToken
};
