const axios = require('axios');
const FormData = require('form-data');

async function testAmmIntegration() {
    console.log('🧪 Testing AMM Integration with Create Meme Coin...\n');

    const API_URL = 'http://localhost:8003';
    
    // Test data
    const testData = {
        name: 'TestMemeCoin',
        symbol: 'TMEME',
        supply: 1000000,
        decimals: 18,
        description: 'Test meme coin for AMM integration',
        creatorWallet: '0.0.6428617', // Your Hedera account ID
        liquidityAllocation: 90,
        creatorAllocation: 10
    };

    try {
        console.log('📤 Creating meme coin with AMM integration...');
        console.log(`📊 Token: ${testData.name} (${testData.symbol})`);
        console.log(`💰 Supply: ${testData.supply.toLocaleString()} tokens`);
        console.log(`🏦 Creator: ${testData.creatorWallet}`);
        console.log(`💧 Liquidity: ${testData.liquidityAllocation}%`);
        
        const form = new FormData();
        Object.keys(testData).forEach(key => {
            form.append(key, testData[key]);
        });

        const response = await axios.post(`${API_URL}/create-meme-coin`, form, {
            headers: {
                ...form.getHeaders(),
            },
            timeout: 120000 // 2 minutes timeout
        });

        console.log('\n✅ Meme coin created successfully!');
        console.log('📋 Response:');
        console.log(JSON.stringify(response.data, null, 2));

        if (response.data.success) {
            const tokenId = response.data.meme_coin.id;
            const ammPool = response.data.meme_coin.amm_pool;
            
            console.log('\n🔍 Testing AMM endpoints...');
            
            // Test pool info endpoint
            if (ammPool && ammPool.success) {
                const tokenAddress = `0x${tokenId.split('.')[2].toString(16).padStart(40, '0')}`;
                
                try {
                    console.log('\n📊 Testing pool info endpoint...');
                    const poolResponse = await axios.get(`${API_URL}/pool/${tokenAddress}`);
                    console.log('Pool Info:', JSON.stringify(poolResponse.data, null, 2));
                } catch (poolError) {
                    console.log('⚠️ Pool info test failed:', poolError.message);
                }

                try {
                    console.log('\n💰 Testing price endpoint...');
                    const priceResponse = await axios.get(`${API_URL}/price/${tokenAddress}/1000`);
                    console.log('Price Info:', JSON.stringify(priceResponse.data, null, 2));
                } catch (priceError) {
                    console.log('⚠️ Price test failed:', priceError.message);
                }
            }

            console.log('\n📋 Testing pools list endpoint...');
            try {
                const poolsResponse = await axios.get(`${API_URL}/pools`);
                console.log('All Pools:', JSON.stringify(poolsResponse.data, null, 2));
            } catch (poolsError) {
                console.log('⚠️ Pools list test failed:', poolsError.message);
            }
        }

    } catch (error) {
        console.error('\n❌ Test failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testAmmIntegration();