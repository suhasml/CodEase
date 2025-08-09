const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function prepareVerification() {
    console.log('📋 Preparing Contract Verification Files...\n');

    try {
        // Load deployment info
        const deploymentPath = path.join(__dirname, '../deployments/MemeAmmRouter.json');
        const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
        
        // Create verification directory
        const verificationDir = path.join(__dirname, '../verification');
        if (!fs.existsSync(verificationDir)) {
            fs.mkdirSync(verificationDir, { recursive: true });
        }

        console.log('📄 Contract Information:');
        console.log(`   Contract Address (EVM): ${deployment.contractAddress}`);
        console.log(`   Contract Address (Hedera): 0.0.6495373`);
        console.log(`   Platform Fee Wallet: ${deployment.platformFeeWallet}`);
        console.log(`   Deployment Date: ${deployment.deploymentDate}`);

        // Read the main contract file
        const contractPath = path.join(__dirname, '../contracts/MemeAmmRouter.sol');
        const contractSource = fs.readFileSync(contractPath, 'utf8');

        // Create flattened contract (combining all imports)
        console.log('\n📦 Creating flattened contract...');
        
        // Read OpenZeppelin contracts that are imported
        const openzeppelinPath = path.join(__dirname, '../node_modules/@openzeppelin/contracts');
        
        // ERC20 Interface
        const ierc20Path = path.join(openzeppelinPath, 'token/ERC20/IERC20.sol');
        const ownablePath = path.join(openzeppelinPath, 'access/Ownable.sol');
        const reentrancyGuardPath = path.join(openzeppelinPath, 'utils/ReentrancyGuard.sol');
        const contextPath = path.join(openzeppelinPath, 'utils/Context.sol');

        let flattenedContract = '';
        
        // Add license identifier
        flattenedContract += '// SPDX-License-Identifier: MIT\n';
        flattenedContract += 'pragma solidity ^0.8.20;\n\n';
        
        // Add Context contract (base for Ownable)
        if (fs.existsSync(contextPath)) {
            const contextSource = fs.readFileSync(contextPath, 'utf8');
            // Remove license and pragma from imports
            const cleanContext = contextSource
                .replace(/\/\/ SPDX-License-Identifier:.*\n/, '')
                .replace(/pragma solidity.*;\n/, '')
                .trim();
            flattenedContract += '// Context.sol\n' + cleanContext + '\n\n';
        }

        // Add IERC20 interface
        if (fs.existsSync(ierc20Path)) {
            const ierc20Source = fs.readFileSync(ierc20Path, 'utf8');
            const cleanIERC20 = ierc20Source
                .replace(/\/\/ SPDX-License-Identifier:.*\n/, '')
                .replace(/pragma solidity.*;\n/, '')
                .trim();
            flattenedContract += '// IERC20.sol\n' + cleanIERC20 + '\n\n';
        }

        // Add Ownable contract
        if (fs.existsSync(ownablePath)) {
            const ownableSource = fs.readFileSync(ownablePath, 'utf8');
            const cleanOwnable = ownableSource
                .replace(/\/\/ SPDX-License-Identifier:.*\n/, '')
                .replace(/pragma solidity.*;\n/, '')
                .replace(/import.*;\n/g, '') // Remove import statements
                .trim();
            flattenedContract += '// Ownable.sol\n' + cleanOwnable + '\n\n';
        }

        // Add ReentrancyGuard contract
        if (fs.existsSync(reentrancyGuardPath)) {
            const reentrancySource = fs.readFileSync(reentrancyGuardPath, 'utf8');
            const cleanReentrancy = reentrancySource
                .replace(/\/\/ SPDX-License-Identifier:.*\n/, '')
                .replace(/pragma solidity.*;\n/, '')
                .replace(/import.*;\n/g, '') // Remove import statements
                .trim();
            flattenedContract += '// ReentrancyGuard.sol\n' + cleanReentrancy + '\n\n';
        }

        // Add main contract (remove imports and license/pragma since they're already added)
        const cleanMainContract = contractSource
            .replace(/\/\/ SPDX-License-Identifier:.*\n/, '')
            .replace(/pragma solidity.*;\n/, '')
            .replace(/import.*;\n/g, '') // Remove all import statements
            .trim();
        
        flattenedContract += '// MemeAmmRouter.sol\n' + cleanMainContract;

        // Save flattened contract
        const flattenedPath = path.join(verificationDir, 'MemeAmmRouter_Flattened.sol');
        fs.writeFileSync(flattenedPath, flattenedContract);

        // Create metadata file
        const metadata = {
            contractName: 'MemeAmmRouter',
            compiler: {
                version: '0.8.20+commit.a1b79de6',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    },
                    outputSelection: {
                        '*': {
                            '*': ['abi', 'evm.bytecode']
                        }
                    }
                }
            },
            constructorParameters: {
                _platformFeeWallet: deployment.platformFeeWallet
            },
            libraries: {},
            immutableReferences: {}
        };

        const metadataPath = path.join(verificationDir, 'metadata.json');
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

        // Create verification instructions
        const instructions = `# Contract Verification Instructions

## Upload Files to HashScan

1. **Main Contract File**: MemeAmmRouter_Flattened.sol
2. **Compiler Version**: v0.8.20+commit.a1b79de6
3. **Optimization**: Enabled (200 runs)
4. **Constructor Parameters**: 
   - _platformFeeWallet: ${deployment.platformFeeWallet}

## Verification Steps:

1. Go to: https://hashscan.io/testnet/contract/0.0.6495373
2. Click "Verify Contract"
3. Upload the flattened contract file
4. Set compiler version: 0.8.20
5. Enable optimization: Yes (200 runs)
6. Add constructor parameter: ${deployment.platformFeeWallet}
7. Submit for verification

## Files Generated:
- MemeAmmRouter_Flattened.sol (main contract file)
- metadata.json (compiler settings)
- verification_instructions.txt (this file)

## Constructor Parameters (ABI Encoded):
${deployment.platformFeeWallet}

Note: The contract address 0.0.6495373 (Hedera format) corresponds to EVM address ${deployment.contractAddress}
`;

        const instructionsPath = path.join(verificationDir, 'verification_instructions.txt');
        fs.writeFileSync(instructionsPath, instructions);

        console.log('\n✅ Verification files prepared!');
        console.log('\n📁 Files created in verification/ directory:');
        console.log('   - MemeAmmRouter_Flattened.sol (upload this to HashScan)');
        console.log('   - metadata.json (compiler settings reference)');
        console.log('   - verification_instructions.txt (step-by-step guide)');

        console.log('\n🔗 Verification Details:');
        console.log(`   Contract: 0.0.6495373`);
        console.log(`   Compiler: 0.8.20`);
        console.log(`   Optimization: Enabled (200 runs)`);
        console.log(`   Constructor Param: ${deployment.platformFeeWallet}`);

        console.log('\n🎯 Next Steps:');
        console.log('1. Go to: https://hashscan.io/testnet/contract/0.0.6495373');
        console.log('2. Click "Verify Contract"');
        console.log('3. Upload: verification/MemeAmmRouter_Flattened.sol');
        console.log('4. Follow the instructions in verification_instructions.txt');

    } catch (error) {
        console.error('❌ Preparation failed:', error.message);
    }
}

prepareVerification().catch(console.error);