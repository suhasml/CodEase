# PowerShell test for AMM integration
Write-Host "🧪 Testing server on localhost:8003..." -ForegroundColor Cyan

try {
    # Test basic endpoint
    Write-Host "`n📡 Testing root endpoint..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "http://localhost:8003/" -Method GET -TimeoutSec 10
    Write-Host "✅ Server responding! Status: $($response.StatusCode)" -ForegroundColor Green
    
    # Test pools endpoint
    Write-Host "`n📊 Testing pools endpoint..." -ForegroundColor Yellow
    $poolsResponse = Invoke-WebRequest -Uri "http://localhost:8003/pools" -Method GET -TimeoutSec 10
    Write-Host "✅ Pools endpoint responding! Status: $($poolsResponse.StatusCode)" -ForegroundColor Green
    
    $poolsData = $poolsResponse.Content | ConvertFrom-Json
    Write-Host "📋 Pools data:" -ForegroundColor Cyan
    Write-Host $poolsResponse.Content
    
    # Test create-meme-coin endpoint with form data
    Write-Host "`n🚀 Testing create-meme-coin endpoint..." -ForegroundColor Yellow
    
    $form = @{
        name = "TestAmmCoin"
        symbol = "TAMM"
        supply = "1000000"
        decimals = "18"
        description = "Test coin for AMM integration"
        creatorWallet = "0.0.6428617"
        liquidityAllocation = "90"
        creatorAllocation = "10"
    }
    
    Write-Host "📤 Sending meme coin creation request..." -ForegroundColor Yellow
    $createResponse = Invoke-WebRequest -Uri "http://localhost:8003/create-meme-coin" -Method POST -Body $form -TimeoutSec 120
    Write-Host "✅ Meme coin endpoint responding! Status: $($createResponse.StatusCode)" -ForegroundColor Green
    
    $createData = $createResponse.Content | ConvertFrom-Json
    Write-Host "🎉 Response:" -ForegroundColor Cyan
    Write-Host $createResponse.Content
    
    if ($createData.success) {
        Write-Host "`n🎊 SUCCESS! AMM integration working!" -ForegroundColor Green
        Write-Host "Token ID: $($createData.meme_coin.id)" -ForegroundColor Cyan
        if ($createData.meme_coin.amm_pool) {
            Write-Host "AMM Pool: $($createData.meme_coin.amm_pool | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "`n❌ Meme coin creation failed" -ForegroundColor Red
        Write-Host "Error: $($createData.message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "`n❌ Test failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Check if server is running on different port
    Write-Host "`n🔍 Checking if server is on port 3003..." -ForegroundColor Yellow
    try {
        $alt = Invoke-WebRequest -Uri "http://localhost:3003/" -Method GET -TimeoutSec 5
        Write-Host "✅ Found server on port 3003!" -ForegroundColor Green
    } catch {
        Write-Host "❌ No server found on port 3003 either" -ForegroundColor Red
    }
}

Write-Host "`n✅ Test completed!" -ForegroundColor Green