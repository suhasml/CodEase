const { ethers } = require("ethers");
require("dotenv").config();

(async () => {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.HASHIO_RPC_URL || "https://testnet.hashio.io/api");
    const wallet = new ethers.Wallet(process.env.OPERATOR_EVM_KEY, provider);

    const source = await require("fs").promises.readFile(__dirname + "/../contracts/LiquidityLocker.sol", "utf8");
    const solc = require("solc");

    const input = {
      language: "Solidity",
      sources: {
        "LiquidityLocker.sol": {
          content: source,
        },
      },
      settings: {
        optimizer: { enabled: true, runs: 200 },
        outputSelection: {
          "*": {
            "*": ["abi", "evm.bytecode"],
          },
        },
      },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    const contractFile = output.contracts["LiquidityLocker.sol"]["LiquidityLocker"];
    const factory = new ethers.ContractFactory(contractFile.abi, contractFile.evm.bytecode.object, wallet);
    const locker = await factory.deploy();
    await locker.waitForDeployment();

    console.log("LiquidityLocker deployed at:", await locker.getAddress());
    console.log("Save this address in .env as LIQUIDITY_LOCKER_ADDRESS");
  } catch (err) {
    console.error(err);
  }
})(); 