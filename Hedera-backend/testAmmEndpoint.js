const http = require('http');
const querystring = require('querystring');

console.log('🧪 Testing AMM Integration on localhost:8003...\n');

// Test basic endpoint first
function testEndpoint(port, path, method = 'GET', postData = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: port,
            path: path,
            method: method,
            headers: {
                'Content-Type': method === 'POST' ? 'application/x-www-form-urlencoded' : 'application/json'
            }
        };

        if (postData && method === 'POST') {
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (postData && method === 'POST') {
            req.write(postData);
        }

        req.end();
    });
}

async function runTests() {
    try {
        // Test 1: Basic connectivity
        console.log('📡 Testing server connectivity...');
        const basicTest = await testEndpoint(8003, '/');
        console.log(`✅ Server responding! Status: ${basicTest.status}`);
        
        // Test 2: Pools endpoint
        console.log('\n📊 Testing pools endpoint...');
        const poolsTest = await testEndpoint(8003, '/pools');
        console.log(`✅ Pools endpoint: Status ${poolsTest.status}`);
        console.log('📋 Pools data:', JSON.stringify(poolsTest.data, null, 2));
        
        // Test 3: Create meme coin with AMM
        console.log('\n🚀 Testing create-meme-coin with AMM...');
        const formData = querystring.stringify({
            name: 'TestAmmCoin',
            symbol: 'TAMM',
            supply: '1000000',
            decimals: '18',
            description: 'Test coin for AMM integration',
            creatorWallet: '0.0.6428617',
            liquidityAllocation: '90',
            creatorAllocation: '10'
        });
        
        console.log('📤 Sending meme coin creation request...');
        const createTest = await testEndpoint(8003, '/create-meme-coin', 'POST', formData);
        console.log(`✅ Create endpoint: Status ${createTest.status}`);
        
        if (createTest.data && createTest.data.success) {
            console.log('\n🎉 SUCCESS! Meme coin created with AMM!');
            console.log(`🪙 Token ID: ${createTest.data.meme_coin.id}`);
            
            if (createTest.data.meme_coin.amm_pool) {
                console.log('🤖 AMM Pool Info:');
                console.log(JSON.stringify(createTest.data.meme_coin.amm_pool, null, 2));
            }
            
            console.log('\n📋 Full Response:');
            console.log(JSON.stringify(createTest.data, null, 2));
            
        } else {
            console.log('\n❌ Meme coin creation failed');
            console.log('📄 Response:', JSON.stringify(createTest.data, null, 2));
        }
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        
        // Try port 3003 as fallback
        try {
            console.log('\n🔍 Trying port 3003...');
            const fallback = await testEndpoint(3003, '/');
            console.log(`✅ Found server on port 3003! Status: ${fallback.status}`);
        } catch (fallbackError) {
            console.log('❌ No server found on port 3003 either');
        }
    }
}

runTests();