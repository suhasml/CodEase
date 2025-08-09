// Simple test without external dependencies
const http = require('http');

async function testSimpleEndpoint() {
    console.log('🧪 Testing server connection...\n');

    const options = {
        hostname: 'localhost',
        port: 8003,
        path: '/',
        method: 'GET'
    };

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('✅ Server is responding!');
                console.log('Status:', res.statusCode);
                
                try {
                    const jsonData = JSON.parse(data);
                    console.log('📋 API Response:');
                    console.log(JSON.stringify(jsonData, null, 2));
                    resolve(jsonData);
                } catch (parseError) {
                    console.log('📄 Raw Response:');
                    console.log(data);
                    resolve(data);
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Connection failed:', error.message);
            reject(error);
        });

        req.setTimeout(5000, () => {
            console.error('❌ Request timeout');
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.end();
    });
}

// Test AMM endpoints
async function testAmmEndpoints() {
    console.log('\n🧪 Testing AMM endpoints...');
    
    // Test pools endpoint
    const poolsOptions = {
        hostname: 'localhost',
        port: 8003,
        path: '/pools',
        method: 'GET'
    };

    return new Promise((resolve, reject) => {
        const req = http.request(poolsOptions, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('✅ Pools endpoint responding!');
                console.log('Status:', res.statusCode);
                
                try {
                    const jsonData = JSON.parse(data);
                    console.log('📊 Pools Response:');
                    console.log(JSON.stringify(jsonData, null, 2));
                    resolve(jsonData);
                } catch (parseError) {
                    console.log('📄 Raw Response:');
                    console.log(data);
                    resolve(data);
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Pools endpoint failed:', error.message);
            reject(error);
        });

        req.end();
    });
}

async function main() {
    try {
        await testSimpleEndpoint();
        await testAmmEndpoints();
        
        console.log('\n🎉 All tests passed!');
        console.log('\n📋 Ready to test meme coin creation:');
        console.log('curl -X POST http://localhost:8003/create-meme-coin \\');
        console.log('  -F "name=TestCoin" \\');
        console.log('  -F "symbol=TEST" \\');
        console.log('  -F "supply=1000000" \\');
        console.log('  -F "decimals=18" \\');
        console.log('  -F "description=Test meme coin" \\');
        console.log('  -F "creatorWallet=0.0.6428617"');
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

main();