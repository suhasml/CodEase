const { Client, ContractInfoQuery, ContractId } = require('@hashgraph/sdk');
require('dotenv').config();

// Create Hedera client
function getHederaClient() {
    if (process.env.HEDERA_NETWORK === "mainnet") {
        return Client.forMainnet().setOperator(
            process.env.OPERATOR_ID,
            process.env.OPERATOR_KEY
        );
    } else {
        return Client.forTestnet().setOperator(
            process.env.OPERATOR_ID,
            process.env.OPERATOR_KEY
        );
    }
}

async function findContractIds() {
    console.log('🔍 Finding actual contract IDs from EVM addresses...');
    
    const client = getHederaClient();
    
    // EVM addresses from deployment
    const addresses = [
        { name: 'PoolManager', evm: '0x22807029b93EF69a27f90d5D68785f1cd8209318' },
        { name: 'FeeManager', evm: '0xF0e0f26b7E73C313dF011a22121dBfB2dE51179d' },
        { name: 'Router', evm: '0x513e413B8Ceed9224719D87a35c80cC52C36BCEF' }
    ];
    
    for (const contract of addresses) {
        try {
            console.log(`\n📍 Processing ${contract.name}: ${contract.evm}`);
            
            // Convert EVM address to potential contract ID
            // Remove 0x prefix and convert to decimal
            const evmNum = BigInt(contract.evm);
            console.log(`🔢 EVM as number: ${evmNum.toString()}`);
            
            // Try to construct a contract ID
            // Hedera contract IDs are usually much smaller numbers
            // Let's try to query recent contract IDs
            
            // Let's try a range of recent contract IDs based on the deployment time
            const baseId = 6503280; // Around the time of deployment
            
            for (let i = -10; i <= 10; i++) {
                const testId = baseId + i;
                try {
                    const contractId = ContractId.fromString(`0.0.${testId}`);
                    const contractInfo = await new ContractInfoQuery()
                        .setContractId(contractId)
                        .execute(client);
                    
                    if (contractInfo.contractId) {
                        console.log(`✅ Found contract 0.0.${testId}:`);
                        console.log(`   - Contract ID: ${contractInfo.contractId.toString()}`);
                        console.log(`   - EVM Address: ${contractInfo.evmAddress || 'Not available'}`);
                        console.log(`   - Contract memo: ${contractInfo.contractMemo || 'None'}`);
                    }
                } catch (error) {
                    // Contract doesn't exist, continue
                }
            }
            
        } catch (error) {
            console.error(`❌ Error processing ${contract.name}:`, error.message);
        }
    }
    
    client.close();
}

findContractIds().catch(console.error);
