# Quick Start with MongoDB Atlas

## ⚡ Fast Setup (5 minutes)

### 1. Get MongoDB Atlas Connection String
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up (free)
2. Create a cluster (free M0 tier)
3. Create database user (Security → Database Access)
4. Whitelist IP: `0.0.0.0/0` (Security → Network Access)
5. Get connection string (Database → Connect → Drivers)

### 2. Configure Your App
```bash
cd backend
```

Edit `.env` file:
```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.xxxxx.mongodb.net/mini-games-platform?retryWrites=true&w=majority
JWT_SECRET=change_this_to_a_random_32_character_string_for_security
PORT=5000
```

### 3. Test Connection
```bash
npm run test-connection
```

You should see: `✅ Successfully connected to MongoDB Atlas!`

### 4. Seed Database
```bash
npm run seed
```

### 5. Start Backend
```bash
npm start
```

### 6. Start Frontend
```bash
cd ../frontend
npm run dev
```

## 🎮 Open the App
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 🔧 Troubleshooting

### Connection Failed?
Run the test connection to see specific error:
```bash
npm run test-connection
```

### Common Issues:

**Authentication Failed**
- Check username/password in connection string
- Special characters? Encode them: `@`→`%40`, `#`→`%23`

**Network Error**
- Go to Atlas → Network Access
- Add IP `0.0.0.0/0` (development only)

**Need Help?**
See detailed guide: [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md)

## 📝 Environment Variables

Required in `backend/.env`:
- `MONGODB_URI` - Your Atlas connection string
- `JWT_SECRET` - Random secure string (32+ chars)
- `PORT` - Server port (default: 5000)

## 🎯 Default Test User (after seeding)

- **Username**: testuser
- **Email**: test@example.com
- **Password**: password123

---

**Ready to play?** Register a new account or login with test credentials! 🚀
