require('dotenv').config();

/**
 * Environment Checker Script
 * Run: node scripts/checkEnv.js
 */

function checkEnvironment() {
    console.log('\n🔍 Environment Variables Checker');
    console.log('━'.repeat(50));
    
    const requiredVars = {
        'OPERATOR_ID': {
            value: process.env.OPERATOR_ID,
            description: 'Your Hedera account ID',
            format: '0.0.123456',
            required: true
        },
        'OPERATOR_KEY': {
            value: process.env.OPERATOR_KEY,
            description: 'Your Hedera private key',
            format: '302e020100300506...',
            required: true
        },
        'OPERATOR_EVM_KEY': {
            value: process.env.OPERATOR_EVM_KEY,
            description: 'EVM private key for DEX interactions',
            format: '0x1234567890...',
            required: true
        },
        'SAUCERSWAP_ROUTER': {
            value: process.env.SAUCERSWAP_ROUTER,
            description: 'SaucerSwap router address',
            format: '0xCf5B8Cc7bC79cfA1465e93d74B740a3fC3d06cB9',
            required: true
        },
        'PLATFORM_WALLET_ADDRESS': {
            value: process.env.PLATFORM_WALLET_ADDRESS,
            description: 'Platform wallet for receiving fees',
            format: '0.0.789012',
            required: true
        },
        'HEDERA_NETWORK': {
            value: process.env.HEDERA_NETWORK,
            description: 'Network to use',
            format: 'testnet or mainnet',
            required: true
        },
        'HASHIO_RPC_URL': {
            value: process.env.HASHIO_RPC_URL,
            description: 'HashIO RPC endpoint',
            format: 'https://testnet.hashio.io/api',
            required: true
        }
    };
    
    const optionalVars = {
        'LIQUIDITY_LOCKER_ADDRESS': {
            value: process.env.LIQUIDITY_LOCKER_ADDRESS,
            description: 'Liquidity locker contract',
            format: '0x1234...',
            required: false
        },
        'PLATFORM_TREASURY_ID': {
            value: process.env.PLATFORM_TREASURY_ID,
            description: 'Platform treasury account',
            format: '0.0.789012',
            required: false
        },
        'PORT': {
            value: process.env.PORT,
            description: 'Server port',
            format: '3003',
            required: false
        }
    };
    
    let allValid = true;
    let warnings = [];
    
    console.log('\n✅ Required Variables:');
    console.log('━'.repeat(25));
    
    for (const [key, config] of Object.entries(requiredVars)) {
        const status = config.value ? '✅' : '❌';
        const displayValue = config.value ? 
            (config.value.length > 20 ? config.value.substring(0, 20) + '...' : config.value) 
            : 'NOT SET';
            
        console.log(`${status} ${key}: ${displayValue}`);
        console.log(`   📝 ${config.description}`);
        console.log(`   📋 Format: ${config.format}`);
        
        if (!config.value && config.required) {
            allValid = false;
        }
        console.log('');
    }
    
    console.log('\n📋 Optional Variables:');
    console.log('━'.repeat(20));
    
    for (const [key, config] of Object.entries(optionalVars)) {
        const status = config.value ? '✅' : '⚪';
        const displayValue = config.value ? 
            (config.value.length > 20 ? config.value.substring(0, 20) + '...' : config.value) 
            : 'not set (optional)';
            
        console.log(`${status} ${key}: ${displayValue}`);
        console.log(`   📝 ${config.description}`);
        console.log('');
    }
    
    // Validation checks
    console.log('\n🔍 Validation Checks:');
    console.log('━'.repeat(20));
    
    // Check Operator ID format
    if (requiredVars.OPERATOR_ID.value) {
        if (!/^0\.0\.\d+$/.test(requiredVars.OPERATOR_ID.value)) {
            warnings.push('⚠️  OPERATOR_ID format should be 0.0.123456');
        } else {
            console.log('✅ OPERATOR_ID format is correct');
        }
    }
    
    // Check EVM key format
    if (requiredVars.OPERATOR_EVM_KEY.value) {
        if (!/^0x[a-fA-F0-9]{64}$/.test(requiredVars.OPERATOR_EVM_KEY.value)) {
            warnings.push('⚠️  OPERATOR_EVM_KEY should be 64 characters after 0x');
        } else {
            console.log('✅ OPERATOR_EVM_KEY format is correct');
        }
    }
    
    // Check network
    if (requiredVars.HEDERA_NETWORK.value) {
        if (!['testnet', 'mainnet'].includes(requiredVars.HEDERA_NETWORK.value)) {
            warnings.push('⚠️  HEDERA_NETWORK should be "testnet" or "mainnet"');
        } else {
            console.log('✅ HEDERA_NETWORK is valid');
        }
    }
    
    // Show warnings
    if (warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        warnings.forEach(warning => console.log(warning));
    }
    
    // Final result
    console.log('\n🎯 Final Result:');
    console.log('━'.repeat(15));
    
    if (allValid && warnings.length === 0) {
        console.log('✅ All environment variables are properly configured!');
        console.log('🚀 You can start the server with: npm start');
    } else if (allValid) {
        console.log('⚠️  Required variables are set but there are warnings');
        console.log('🚀 You can still start the server, but check warnings above');
    } else {
        console.log('❌ Missing required environment variables');
        console.log('📝 Please check the SETUP_GUIDE.md for instructions');
        console.log('🔧 Or run: node scripts/generateEVMKey.js to generate keys');
    }
    
    console.log('\n📚 Need help?');
    console.log('   📖 Read: SETUP_GUIDE.md');
    console.log('   🔑 Generate keys: node scripts/generateEVMKey.js');
    console.log('   🏥 Test server: npm start');
}

if (require.main === module) {
    checkEnvironment();
}

module.exports = { checkEnvironment }; 