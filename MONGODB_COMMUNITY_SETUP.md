# MongoDB Community Setup Guide for Windows

## 📥 Step 1: Download MongoDB Community

1. **Go to MongoDB Download Page**:
   - Visit: https://www.mongodb.com/try/download/community
   - Select: **Windows x64**
   - Version: **Latest (7.0 or newer)**
   - Package: **MSI** (recommended for Windows)

2. **Download the MSI installer** (approximately 300MB)

## 🔧 Step 2: Install MongoDB Community

1. **Run the downloaded MSI file** as Administrator
2. **Installation Wizard Steps**:
   - Click "Next" on Welcome screen
   - Accept License Agreement → Click "Next"
   - Choose "Complete" installation → Click "Next"
   - **Service Configuration** (IMPORTANT):
     - ✅ Check "Install MongoDB as a Service"
     - ✅ Check "Run service as Network Service user"
     - Service Name: `MongoDB`
     - Data Directory: `C:\Program Files\MongoDB\Server\7.0\data\`
     - Log Directory: `C:\Program Files\MongoDB\Server\7.0\log\`
   - **MongoDB Compass** (Optional):
     - ✅ Check "Install MongoDB Compass" (GUI tool - recommended)
   - Click "Install"

3. **Wait for installation** (5-10 minutes)

## ⚙️ Step 3: Verify Installation

### Option A: Check Windows Services
1. Press `Windows + R` → Type `services.msc` → Press Enter
2. Look for "MongoDB" service
3. Status should be "Running"

### Option B: Command Line Check
1. Open Command Prompt as Administrator
2. Run:
```cmd
net start MongoDB
```
Should show: "The MongoDB service is starting" or "service has started successfully"

## 🌐 Step 4: Add MongoDB to System PATH (Optional but Recommended)

1. **Open System Properties**:
   - Press `Windows + X` → Select "System"
   - Click "Advanced system settings"
   - Click "Environment Variables"

2. **Edit PATH Variable**:
   - Under "System variables" → Select "Path" → Click "Edit"
   - Click "New" → Add: `C:\Program Files\MongoDB\Server\7.0\bin`
   - Click "OK" on all dialogs

3. **Restart Command Prompt** to use `mongo` and `mongod` commands

## 🧪 Step 5: Test MongoDB Connection

### Method 1: Using MongoDB Compass (GUI)
1. Open "MongoDB Compass" from Start menu
2. Connection string: `mongodb://localhost:27017`
3. Click "Connect"
4. You should see the MongoDB interface

### Method 2: Using Command Line
1. Open Command Prompt
2. Run:
```cmd
mongo --version
```
Should show MongoDB version info

3. Connect to MongoDB:
```cmd
mongo
```
Should show MongoDB shell prompt: `>`

### Method 3: Test with Your Project
1. Navigate to your project backend folder
2. Run:
```cmd
npm run test-connection
```
Should show: "✅ Successfully connected to MongoDB!"

## 🔧 Step 6: Configure MongoDB for Your Project

Your project is already configured! The `.env` file has:
```env
MONGODB_URI=mongodb://localhost:27017/mini-games-platform
```

This connects to:
- **Host**: localhost (your computer)
- **Port**: 27017 (MongoDB default port)
- **Database**: mini-games-platform (will be created automatically)

## 🎮 Step 7: Populate Your Database

Once MongoDB is running, populate it with game data:

```cmd
cd backend
npm run seed
```

This creates:
- 5 sample games (Reaction Timer, Click Speed Test, etc.)
- Database collections (users, games, scores)

## 🛠️ Troubleshooting

### Problem: "MongoDB service won't start"
**Solution**:
1. Open Command Prompt as Administrator
2. Run: `net start MongoDB`
3. If fails, check Windows Event Viewer for errors

### Problem: "Connection refused"
**Solution**:
1. Check if MongoDB service is running in Services
2. Restart the service: `net stop MongoDB` then `net start MongoDB`
3. Check firewall isn't blocking port 27017

### Problem: "mongo command not found"
**Solution**:
1. Add MongoDB bin folder to PATH (Step 4 above)
2. Or use full path: `"C:\Program Files\MongoDB\Server\7.0\bin\mongo.exe"`

### Problem: "Access denied"
**Solution**:
1. Run Command Prompt as Administrator
2. Check MongoDB data folder permissions

## 📊 MongoDB Compass (GUI Tool)

If you installed MongoDB Compass:
1. **Open Compass** from Start menu
2. **Connect** to `mongodb://localhost:27017`
3. **View your data**:
   - Database: `mini-games-platform`
   - Collections: `users`, `games`, `scores`
4. **Browse and edit** data visually

## 🎯 Next Steps After Installation

1. **Verify MongoDB is running**:
   ```cmd
   npm run test-connection
   ```

2. **Seed the database**:
   ```cmd
   npm run seed
   ```

3. **Start your backend**:
   ```cmd
   npm start
   ```

4. **Test the API** using PowerShell commands or browser

## 📝 Default Configuration

- **Service Name**: MongoDB
- **Port**: 27017
- **Data Directory**: `C:\Program Files\MongoDB\Server\7.0\data\`
- **Log Directory**: `C:\Program Files\MongoDB\Server\7.0\log\`
- **Config File**: `C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg`

## 🔐 Security Notes

For development:
- MongoDB runs without authentication (default)
- Only accessible from localhost
- Perfect for local development

For production:
- Enable authentication
- Configure firewall rules
- Use strong passwords

---

## 🎉 You're Ready!

Once MongoDB Community is installed and running, your gaming platform will have:
- ✅ Local database storage
- ✅ Fast performance
- ✅ No internet dependency
- ✅ Full control over your data

Happy coding! 🚀