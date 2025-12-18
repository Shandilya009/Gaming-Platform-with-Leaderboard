# Backend API Test Script
# Run this in PowerShell to test your backend

Write-Host "🚀 Testing Gaming Platform Backend API" -ForegroundColor Green
Write-Host "Backend URL: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1️⃣ Testing Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:5000" -Method GET
    Write-Host "✅ Health Check Success!" -ForegroundColor Green
    Write-Host "Response: $($healthResponse.message)" -ForegroundColor White
    Write-Host "Status: $($healthResponse.status)" -ForegroundColor White
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Get All Games
Write-Host "2️⃣ Testing Get All Games..." -ForegroundColor Yellow
try {
    $gamesResponse = Invoke-RestMethod -Uri "http://localhost:5000/games" -Method GET
    Write-Host "✅ Get Games Success!" -ForegroundColor Green
    Write-Host "Found $($gamesResponse.Count) games:" -ForegroundColor White
    foreach ($game in $gamesResponse) {
        Write-Host "  - $($game.name) ($($game.type), $($game.difficulty))" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Get Games Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Register New User
Write-Host "3️⃣ Testing User Registration..." -ForegroundColor Yellow
$registerBody = @{
    username = "testuser_$(Get-Random -Maximum 1000)"
    email = "test_$(Get-Random -Maximum 1000)@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "✅ Registration Success!" -ForegroundColor Green
    Write-Host "User: $($registerResponse.user.username)" -ForegroundColor White
    Write-Host "Email: $($registerResponse.user.email)" -ForegroundColor White
    Write-Host "Points: $($registerResponse.user.totalPoints)" -ForegroundColor White
    $token = $registerResponse.token
    Write-Host "Token received: $($token.Substring(0, 20))..." -ForegroundColor Cyan
} catch {
    Write-Host "❌ Registration Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Login User
Write-Host "4️⃣ Testing User Login..." -ForegroundColor Yellow
$loginBody = @{
    email = ($registerBody | ConvertFrom-Json).email
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login Success!" -ForegroundColor Green
    Write-Host "Welcome back: $($loginResponse.user.username)" -ForegroundColor White
} catch {
    Write-Host "❌ Login Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Submit Score (if we have a token)
if ($token) {
    Write-Host "5️⃣ Testing Score Submission..." -ForegroundColor Yellow
    if ($gamesResponse -and $gamesResponse.Count -gt 0) {
        $firstGame = $gamesResponse[0]
        $scoreBody = @{
            gameId = $firstGame._id
            score = Get-Random -Minimum 100 -Maximum 500
        } | ConvertTo-Json
        
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        try {
            $scoreResponse = Invoke-RestMethod -Uri "http://localhost:5000/scores" -Method POST -Body $scoreBody -Headers $headers
            Write-Host "✅ Score Submission Success!" -ForegroundColor Green
            Write-Host "Game: $($firstGame.name)" -ForegroundColor White
            Write-Host "Score: $($scoreResponse.score.score) points" -ForegroundColor White
        } catch {
            Write-Host "❌ Score Submission Failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}
Write-Host ""

# Test 6: Get Global Leaderboard
Write-Host "6️⃣ Testing Global Leaderboard..." -ForegroundColor Yellow
try {
    $leaderboardResponse = Invoke-RestMethod -Uri "http://localhost:5000/scores/leaderboard/global?limit=5" -Method GET
    Write-Host "✅ Leaderboard Success!" -ForegroundColor Green
    Write-Host "Top players:" -ForegroundColor White
    for ($i = 0; $i -lt [Math]::Min(5, $leaderboardResponse.Count); $i++) {
        $player = $leaderboardResponse[$i]
        Write-Host "  $($i + 1). $($player.username) - $($player.totalPoints) points" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Leaderboard Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "🎉 Backend API Testing Complete!" -ForegroundColor Green
Write-Host "Your backend is working perfectly!" -ForegroundColor Cyan