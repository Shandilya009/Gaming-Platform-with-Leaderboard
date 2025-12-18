# 🚀 MongoDB Atlas Configuration Steps

## ⚠️ IMPORTANT: Complete These Steps After Creating Your Atlas Account

### Step 1: Update Your Connection String

After you get your MongoDB Atlas connection string, you need to update the `.env` file.

**Your connection string will look like this:**
```
mongodb+srv://gameadmin:AbC123XyZ@cluster0.abc12.mongodb.net/?retryWrites=true&w=majority
```

### Step 2: Edit the .env File

1. **Open**: `backend/.env` file
2. **Replace** the `MONGODB_URI` line with your actual connection string
3. **Add** the database name `mini-games-platform` after `.net/`

**Example:**
```env
# Before (template):
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/mini-games-platform?retryWrites=true&w=majority

# After (with your actual details):
MONGODB_URI=mongodb+srv://gameadmin:AbC123XyZ@cluster0.abc12.mongodb.net/mini-games-platform?retryWrites=true&w=majority
```

### Step 3: Handle Special Characters in Password

If your password contains special characters, you need to URL encode them:

| Character | Encoded |
|-----------|---------|
| @         | %40     |
| #         | %23     |
| %         | %25     |
| +         | %2B     |
| /         | %2F     |
| ?         | %3F     |
| =         | %3D     |

**Example:**
- Password: `MyPass@123#`
- Encoded: `MyPass%40123%23`

### Step 4: Test the Connection

After updating your `.env` file, run:

```bash
cd backend
npm run test-connection
```

You should see:
```
✅ Successfully connected to MongoDB Atlas!
```

### Step 5: Seed Your Database

Once connected, populate your database:

```bash
npm run seed
```

### Step 6: Start Your Application

```bash
# Start backend
npm start

# In another terminal, start frontend
cd ../frontend
npm run dev
```

---

## 🔧 Quick Setup Commands

After updating your `.env` file, run these commands:

```bash
# Navigate to backend
cd backend

# Test connection
npm run test-connection

# Seed database
npm run seed

# Start backend server
npm start
```

Then in another terminal:
```bash
# Navigate to frontend
cd frontend

# Start frontend server
npm run dev
```

---

## 🎯 What You Need to Replace

In the `backend/.env` file, replace:

1. **YOUR_USERNAME** → Your Atlas database username (e.g., `gameadmin`)
2. **YOUR_PASSWORD** → Your Atlas database password (URL encoded if needed)
3. **YOUR_CLUSTER** → Your cluster name (e.g., `cluster0.abc12`)

---

## 📋 Checklist

- [ ] Created MongoDB Atlas account
- [ ] Created free M0 cluster
- [ ] Created database user with read/write permissions
- [ ] Added IP address to Network Access (0.0.0.0/0 for development)
- [ ] Copied connection string from Atlas
- [ ] Updated `backend/.env` with connection string
- [ ] Added database name `mini-games-platform` to connection string
- [ ] URL encoded special characters in password (if any)
- [ ] Tested connection with `npm run test-connection`
- [ ] Seeded database with `npm run seed`
- [ ] Started both backend and frontend servers

---

## 🆘 Need Help?

If you encounter any issues:

1. **Check** your connection string format
2. **Verify** username and password are correct
3. **Ensure** IP address is whitelisted
4. **Test** connection with `npm run test-connection`

**Common Error Solutions:**
- Authentication failed → Check username/password
- Network error → Check IP whitelist
- Connection timeout → Check internet connection

---

## 🎉 Success Indicators

When everything is working, you'll see:

✅ **Backend**: "Successfully connected to MongoDB Atlas!"
✅ **Database**: Collections created (users, games, scores)
✅ **Frontend**: Loads at http://localhost:5173
✅ **API**: Responds at http://localhost:5001

**Ready to play!** 🎮