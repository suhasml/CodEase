const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
    console.log('🚀 Deploying Minimal Test Contract to Hedera Testnet...\n');

    // Validate environment variables
    if (!process.env.HEDERA_TESTNET_RPC_URL || !process.env.PRIVATE_KEY) {
        console.error('❌ Missing required environment variables!');
        process.exit(1);
    }

    try {
        // Setup provider and wallet
        const provider = new ethers.JsonRpcProvider(process.env.HEDERA_TESTNET_RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        console.log(`📍 Deployer address: ${wallet.address}`);
        
        // Check balance
        const balance = await provider.getBalance(wallet.address);
        console.log(`💰 Deployer balance: ${ethers.formatEther(balance)} HBAR`);

        // Simple contract code for testing
        const contractSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MinimalTest {
    address public owner;
    string public name;
    
    constructor(string memory _name) {
        owner = msg.sender;
        name = _name;
    }
    
    function getName() public view returns (string memory) {
        return name;
    }
}`;
        
        console.log('\n📄 Compiling MinimalTest contract...');
        
        // Import compiler
        const solc = require('solc');
        
        // Setup compiler input
        const input = {
            language: 'Solidity',
            sources: {
                'MinimalTest.sol': {
                    content: contractSource
                }
            },
            settings: {
                outputSelection: {
                    '*': {
                        '*': ['abi', 'evm.bytecode']
                    }
                },
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        };

        const output = JSON.parse(solc.compile(JSON.stringify(input)));
        
        if (output.errors) {
            const hasErrors = output.errors.some(error => error.severity === 'error');
            if (hasErrors) {
                console.error('❌ Compilation errors:', output.errors);
                process.exit(1);
            }
        }

        const contract = output.contracts['MinimalTest.sol']['MinimalTest'];
        const abi = contract.abi;
        const bytecode = contract.evm.bytecode.object;

        console.log('✅ Contract compiled successfully!');

        // Deploy contract
        console.log('\n🔨 Deploying contract...');
        
        const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
        
        // Deploy with minimal gas settings for Hedera
        const deployOptions = {
            gasLimit: 1000000
        };
        
        const deployedContract = await contractFactory.deploy("Test Name", deployOptions);
        console.log(`📤 Transaction sent: ${deployedContract.deploymentTransaction().hash}`);
        console.log('⏳ Waiting for confirmation...');

        await deployedContract.waitForDeployment();
        const contractAddress = await deployedContract.getAddress();

        console.log('\n✅ MinimalTest deployed successfully!');
        console.log(`📍 Contract address: ${contractAddress}`);
        console.log(`🔗 Explorer: https://hashscan.io/testnet/contract/${contractAddress}`);

        // Verify the contract is working by calling a function
        console.log('\n🧪 Testing contract function...');
        
        // Wait a moment to make sure the contract is fully deployed
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        try {
            const name = await deployedContract.getName();
            console.log(`✅ Contract function call successful: name = "${name}"`);
        } catch (error) {
            console.error('❌ Contract function call failed:', error.message);
        }

    } catch (error) {
        console.error('\n❌ Deployment failed:');
        console.error(error.message);
        process.exit(1);
    }
}

main().catch(console.error);
