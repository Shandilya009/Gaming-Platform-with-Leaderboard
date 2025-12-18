# MongoDB Atlas Connection String Guide

## 🔗 Connection String Format

Your MongoDB Atlas connection string should look like this:

```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.xxxxx.mongodb.net/DATABASE?retryWrites=true&w=majority
```

## 📋 Breaking It Down

```
mongodb+srv://     ←  Protocol (always the same)
    |
    ├── USERNAME   ←  Your database user (not your Atlas login!)
    |
    ├── PASSWORD   ←  Your database user password
    |
    ├── CLUSTER    ←  Your cluster name (e.g., cluster0, mycluster, etc.)
    |
    ├── .xxxxx.mongodb.net  ←  Auto-generated cluster domain
    |
    ├── /DATABASE  ←  Your database name (e.g., mini-games-platform)
    |
    └── ?retryWrites=true&w=majority  ←  Connection options
```

## ✏️ Example (Before)

What you get from MongoDB Atlas:
```
mongodb+srv://<username>:<password>@cluster0.abc12.mongodb.net/?retryWrites=true&w=majority
```

## ✅ Example (After - What You Need)

What you should put in your `.env` file:
```
mongodb+srv://gameadmin:MySecurePass123@cluster0.abc12.mongodb.net/mini-games-platform?retryWrites=true&w=majority
```

### Changes Made:
1. ✅ Replaced `<username>` with `gameadmin`
2. ✅ Replaced `<password>` with `MySecurePass123`
3. ✅ Added `/mini-games-platform` after `.net` (database name)
4. ✅ Kept all connection options

## 🚨 Special Characters in Password

If your password contains special characters, you need to URL-encode them:

| Character | Encoded | Example |
|-----------|---------|---------|
| `@` | `%40` | `P@ss` → `P%40ss` |
| `#` | `%23` | `Pa#s` → `Pa%23s` |
| `%` | `%25` | `P%as` → `P%25as` |
| `/` | `%2F` | `Pa/s` → `Pa%2Fs` |
| `:` | `%3A` | `Pas:` → `Pas%3A` |
| `?` | `%3F` | `Pas?` → `Pas%3F` |

### Example with Special Characters:

**Original Password:** `MyP@ss#2024`

**URL Encoded:** `MyP%40ss%232024`

**Full Connection String:**
```
mongodb+srv://admin:MyP%40ss%232024@cluster0.abc12.mongodb.net/mini-games-platform?retryWrites=true&w=majority
```

## 📝 Step-by-Step: Fill Your Connection String

1. Copy this template:
   ```
   mongodb+srv://USERNAME:PASSWORD@CLUSTER.xxxxx.mongodb.net/DATABASE?retryWrites=true&w=majority
   ```

2. Replace `USERNAME` with your database username

3. Replace `PASSWORD` with your database password (encode special characters!)

4. Replace `CLUSTER.xxxxx` with your cluster name from Atlas

5. Replace `DATABASE` with `mini-games-platform`

6. Paste it in `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://...your full string here...
   ```

## ✅ Verify Your Connection

After setting up, test it:

```bash
cd backend
npm run test-connection
```

You should see:
```
✅ Successfully connected to MongoDB Atlas!
```

## 🔍 Where to Find Each Part

### 1. USERNAME & PASSWORD
- Go to: **MongoDB Atlas → Security → Database Access**
- This is the database user you created (NOT your Atlas account login)
- Click "Edit" on a user to reset password if needed

### 2. CLUSTER NAME
- Go to: **MongoDB Atlas → Database (Clusters)**
- Look for your cluster name (usually `Cluster0` or similar)
- It's shown at the top of your cluster card

### 3. FULL CONNECTION STRING
- Go to: **MongoDB Atlas → Database**
- Click **"Connect"** button on your cluster
- Choose **"Connect your application"**
- Select: **Driver: Node.js** | **Version: 5.5 or later**
- Copy the connection string shown

### 4. DATABASE NAME
- You choose this! For this project: `mini-games-platform`
- Add it after `.mongodb.net/` in the connection string

## 🎯 Quick Check

Your connection string is correct if:
- ✅ Starts with `mongodb+srv://`
- ✅ Has username and password (no `<` or `>` brackets)
- ✅ Has your cluster domain (`.mongodb.net`)
- ✅ Has `/mini-games-platform` after `.mongodb.net`
- ✅ Ends with `?retryWrites=true&w=majority`

## ❌ Common Mistakes

### ❌ Wrong:
```
mongodb+srv://<username>:<password>@cluster0...
```
Still has placeholders!

### ❌ Wrong:
```
mongodb+srv://admin:pass@cluster0.abc12.mongodb.net?retryWrites=true
```
Missing database name after `.net`!

### ❌ Wrong:
```
mongodb+srv://admin:my@pass@cluster0.abc12.mongodb.net/mini-games-platform
```
Password has unencoded special character (`@`)!

### ✅ Correct:
```
mongodb+srv://admin:my%40pass@cluster0.abc12.mongodb.net/mini-games-platform?retryWrites=true&w=majority
```

## 🆘 Still Having Issues?

Run the test connection script for detailed diagnostics:
```bash
npm run test-connection
```

Or check the full guide: [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md)

---

**Pro Tip:** Use the "Autogenerate Secure Password" option in MongoDB Atlas when creating a database user - it creates a password without special characters! 🎲
