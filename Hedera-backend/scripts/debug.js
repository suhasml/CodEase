const { ethers } = require("ethers");
require("dotenv").config();

(async () => {
  try {
    console.log("🔍 Starting Hedera Account Debugging...\n");

    // Initialize provider and wallet
    const rpcUrl = process.env.HASHIO_RPC_URL || "https://testnet.hashio.io/api";
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(process.env.OPERATOR_EVM_KEY, provider);

    console.log("📋 Configuration:");
    console.log("RPC URL:", rpcUrl);
    console.log("Wallet Address:", wallet.address);
    console.log("Private Key (first 10 chars):", process.env.OPERATOR_EVM_KEY?.substring(0, 10) + "...");
    console.log("");

    // 1. Check network connection
    console.log("🌐 Checking Network Connection...");
    try {
      const network = await provider.getNetwork();
      console.log("✅ Connected to network:");
      console.log("  Chain ID:", network.chainId.toString());
      console.log("  Network Name:", network.name);
      console.log("");
    } catch (error) {
      console.error("❌ Network connection failed:", error.message);
      return;
    }

    // 2. Check account balance
    console.log("💰 Checking Account Balance...");
    try {
      const balance = await provider.getBalance(wallet.address);
      const balanceInHbar = ethers.formatEther(balance);
      console.log("✅ Account Balance:", balanceInHbar, "HBAR");
      
      if (balance === 0n) {
        console.log("⚠️  WARNING: Zero balance! You need HBAR for gas fees.");
        console.log("   Get testnet HBAR from: https://portal.hedera.com/faucet");
      }
      console.log("");
    } catch (error) {
      console.error("❌ Balance check failed:", error.message);
      console.log("");
    }

    // 3. Check if account exists on network
    console.log("🔍 Checking Account Existence...");
    try {
      const code = await provider.getCode(wallet.address);
      const nonce = await provider.getTransactionCount(wallet.address);
      
      console.log("✅ Account Status:");
      console.log("  Account exists:", code !== "0x" || nonce > 0 ? "Yes" : "Possibly not activated");
      console.log("  Transaction Count (Nonce):", nonce);
      console.log("  Contract Code Length:", code.length);
      console.log("");
    } catch (error) {
      console.error("❌ Account existence check failed:", error.message);
      console.log("");
    }

    // 4. Test a simple transaction estimation
    console.log("⛽ Testing Gas Estimation...");
    try {
      // Simple transfer transaction to test gas estimation
      const gasEstimate = await provider.estimateGas({
        to: wallet.address, // Send to self
        value: ethers.parseEther("0.001"), // 0.001 HBAR
        from: wallet.address
      });
      console.log("✅ Gas estimation successful:", gasEstimate.toString());
      console.log("");
    } catch (error) {
      console.error("❌ Gas estimation failed:", error.message);
      console.log("   This suggests the account is not properly activated on Hedera");
      console.log("");
    }

    // 5. Check latest block
    console.log("📦 Checking Latest Block...");
    try {
      const latestBlock = await provider.getBlockNumber();
      const block = await provider.getBlock(latestBlock);
      console.log("✅ Latest Block Info:");
      console.log("  Block Number:", latestBlock);
      console.log("  Block Hash:", block?.hash);
      console.log("  Block Timestamp:", new Date((block?.timestamp || 0) * 1000).toISOString());
      console.log("");
    } catch (error) {
      console.error("❌ Block info failed:", error.message);
      console.log("");
    }

    // 6. Provide recommendations
    console.log("💡 Recommendations:");
    
    const balance = await provider.getBalance(wallet.address).catch(() => 0n);
    const nonce = await provider.getTransactionCount(wallet.address).catch(() => 0);
    
    if (balance === 0n) {
      console.log("1. 🚨 Get testnet HBAR from the faucet:");
      console.log("   - Visit: https://portal.hedera.com/faucet");
      console.log("   - Enter your address:", wallet.address);
      console.log("   - Request testnet HBAR");
    }
    
    if (nonce === 0) {
      console.log("2. 🔑 Account might not be activated:");
      console.log("   - Create account via Hedera Portal: https://portal.hedera.com/");
      console.log("   - Or use a different private key from an existing Hedera account");
    }
    
    console.log("3. 🔧 Alternative RPC endpoints to try:");
    console.log("   - https://testnet.hashio.io/api");
    console.log("   - https://pool-babylonlabs-testnet.hashio.io/api");
    
    console.log("\n✨ Debug complete!");

    // --- Hedera SDK Native Account/Key Debug ---
    console.log("\n🔎 Hedera Native Account/Key Debug:");
    const OPERATOR_ID = process.env.OPERATOR_ID;
    const OPERATOR_KEY = process.env.OPERATOR_KEY;
    if (!OPERATOR_ID || !OPERATOR_KEY) {
      console.log("⚠️  OPERATOR_ID or OPERATOR_KEY not set in .env");
    } else {
      console.log("Hedera Account ID:", OPERATOR_ID);
      console.log("Hedera Private Key (first 10 chars):", OPERATOR_KEY.substring(0, 10) + "...");
      try {
        const { Client, AccountId, PrivateKey } = require("@hashgraph/sdk");
        const NETWORK = process.env.HEDERA_NETWORK || "testnet";
        let client;
        if (NETWORK === "mainnet") {
          client = Client.forMainnet();
        } else {
          client = Client.forTestnet();
        }
        client.setOperator(AccountId.fromString(OPERATOR_ID), PrivateKey.fromString(OPERATOR_KEY));
        // Try to get account info
        const { AccountBalanceQuery } = require("@hashgraph/sdk");
        const info = await new AccountBalanceQuery()
          .setAccountId(AccountId.fromString(OPERATOR_ID))
          .execute(client);
        console.log("✅ Hedera SDK: Account balance:", info.hbars.toString());
      } catch (err) {
        console.error("❌ Hedera SDK error:", err.message);
        if (err.status) {
          console.error("Status:", err.status.toString());
        }
      }
    }
  } catch (error) {
    console.error("💥 Unexpected error during debugging:", error);
  }
})();