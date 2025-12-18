# MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas for your Mini Games Platform.

## Step 1: Create a MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"** or **"Sign Up"**
3. Sign up using your email, Google, or GitHub account

## Step 2: Create a New Cluster

1. After logging in, you'll be prompted to create a cluster
2. Choose the **FREE tier** (M0 Sandbox):
   - Cloud Provider: AWS, Google Cloud, or Azure (your choice)
   - Region: Choose the one closest to you
3. Click **"Create Cluster"** (or **"Create"**)
4. Wait 3-5 minutes for your cluster to be provisioned

## Step 3: Create a Database User

1. On the left sidebar, click **"Database Access"** under the Security section
2. Click **"Add New Database User"**
3. Choose **"Password"** as the authentication method
4. Set a username (e.g., `admin`, `gameapp`, etc.)
5. Set a strong password (or use the **"Autogenerate Secure Password"** button)
   - **⚠️ IMPORTANT**: Save this password somewhere safe!
6. Under **"Database User Privileges"**, select **"Read and write to any database"**
7. Click **"Add User"**

## Step 4: Whitelist Your IP Address

1. On the left sidebar, click **"Network Access"** under the Security section
2. Click **"Add IP Address"**
3. For development, you can either:
   - Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`) - **easier for development**
   - Or click **"Add Current IP Address"** - **more secure**
4. Click **"Confirm"**

## Step 5: Get Your Connection String

1. Click **"Database"** on the left sidebar (or click **"Browse Collections"** button)
2. Click the **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Select:
   - **Driver**: Node.js
   - **Version**: 5.5 or later
5. Copy the connection string (it looks like this):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Configure Your Application

1. Open the `backend/.env` file in your project
2. Replace the `MONGODB_URI` value with your connection string:
   ```env
   MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/mini-games-platform?retryWrites=true&w=majority
   ```
3. **Important replacements**:
   - Replace `<username>` with your database username
   - Replace `<password>` with your database password
   - Add the database name after `.net/`: `mini-games-platform`
   
   **Example**:
   ```env
   MONGODB_URI=mongodb+srv://admin:MyPassword123@cluster0.abc12.mongodb.net/mini-games-platform?retryWrites=true&w=majority
   ```

4. Also update your JWT_SECRET to something secure:
   ```env
   JWT_SECRET=your_random_secure_secret_key_at_least_32_characters_long
   ```

## Step 7: Test Your Connection

1. Open a terminal in the `backend` folder
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Start your backend server:
   ```bash
   npm start
   ```
4. You should see:
   ```
   Connected to MongoDB
   Server is running on port 5000
   ```

## Step 8: Seed Your Database (Optional)

To populate your database with initial game data:

```bash
npm run seed
```

You should see:
```
✅ Database seeded successfully!
4 games added
1 test user created
```

## Step 9: View Your Data in MongoDB Atlas

1. Go back to MongoDB Atlas
2. Click **"Browse Collections"** on your cluster
3. You should see your database: `mini-games-platform`
4. Inside, you'll see collections: `games`, `users`, `scores`

## Troubleshooting

### Error: "MongoNetworkError: connection refused"
- Check that your IP address is whitelisted in Network Access
- Try using "Allow Access from Anywhere" (0.0.0.0/0)

### Error: "Authentication failed"
- Double-check your username and password in the connection string
- Make sure there are no special characters that need URL encoding
- If your password has special characters like `@`, `#`, `%`, you need to encode them:
  - `@` becomes `%40`
  - `#` becomes `%23`
  - `%` becomes `%25`

### Error: "ENOTFOUND cluster0.xxxxx.mongodb.net"
- Check your internet connection
- Verify the connection string is correct

### Connection is slow
- Choose a region closer to your location when creating the cluster
- Free tier clusters may have slower performance

## Security Best Practices

1. ✅ **Never commit `.env` file to Git** (it's already in `.gitignore`)
2. ✅ **Use strong, unique passwords** for database users
3. ✅ **Restrict IP access** in production (don't use 0.0.0.0/0)
4. ✅ **Use environment variables** for all sensitive data
5. ✅ **Rotate your JWT_SECRET** regularly in production

## Production Deployment

When deploying to production (Heroku, Vercel, Railway, etc.):

1. Add your production server's IP to Network Access in MongoDB Atlas
2. Set environment variables in your hosting platform
3. Use a strong, unique JWT_SECRET
4. Consider upgrading to a paid MongoDB Atlas tier for better performance

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)

---

**Need Help?** Visit the [MongoDB Community Forums](https://www.mongodb.com/community/forums/)
