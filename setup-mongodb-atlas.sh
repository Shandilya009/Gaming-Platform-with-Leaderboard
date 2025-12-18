#!/bin/bash

# MongoDB Atlas Setup Script for Gaming Platform
# This script guides you through the Atlas setup process

echo "🎮 Gaming Platform - MongoDB Atlas Setup"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    echo "   (The directory containing backend/ and frontend/ folders)"
    exit 1
fi

echo -e "${BLUE}📋 Setup Checklist:${NC}"
echo "   1. Create MongoDB Atlas account"
echo "   2. Create free M0 cluster"
echo "   3. Create database user"
echo "   4. Configure network access"
echo "   5. Get connection string"
echo "   6. Update .env file"
echo ""

echo -e "${YELLOW}🌐 Step 1: Create MongoDB Atlas Account${NC}"
echo "   Visit: https://www.mongodb.com/cloud/atlas"
echo "   Click 'Try Free' and sign up"
echo ""
read -p "Press Enter when you've created your account..."

echo ""
echo -e "${YELLOW}🏗️  Step 2: Create Free Cluster${NC}"
echo "   1. Choose M0 FREE tier"
echo "   2. Select AWS as provider"
echo "   3. Choose region closest to you"
echo "   4. Click 'Create Cluster'"
echo "   5. Wait 3-5 minutes for provisioning"
echo ""
read -p "Press Enter when your cluster is ready..."

echo ""
echo -e "${YELLOW}👤 Step 3: Create Database User${NC}"
echo "   1. Go to Security → Database Access"
echo "   2. Click 'Add New Database User'"
echo "   3. Choose Password authentication"
echo "   4. Set username (e.g., 'gameadmin')"
echo "   5. Use 'Autogenerate Secure Password'"
echo "   6. Select 'Read and write to any database'"
echo "   7. Click 'Add User'"
echo ""
echo -e "${RED}⚠️  IMPORTANT: Save your username and password!${NC}"
echo ""
read -p "Enter your database username: " DB_USERNAME
read -s -p "Enter your database password: " DB_PASSWORD
echo ""

echo ""
echo -e "${YELLOW}🌍 Step 4: Configure Network Access${NC}"
echo "   1. Go to Security → Network Access"
echo "   2. Click 'Add IP Address'"
echo "   3. Click 'Allow Access from Anywhere'"
echo "   4. Click 'Confirm'"
echo ""
read -p "Press Enter when network access is configured..."

echo ""
echo -e "${YELLOW}🔗 Step 5: Get Connection String${NC}"
echo "   1. Go to Database → Browse Collections"
echo "   2. Click 'Connect' on your cluster"
echo "   3. Choose 'Connect your application'"
echo "   4. Select Node.js driver"
echo "   5. Copy the connection string"
echo ""
echo "Your connection string should look like:"
echo "mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority"
echo ""
read -p "Paste your connection string here: " CONNECTION_STRING

# Validate connection string format
if [[ ! $CONNECTION_STRING == mongodb+srv://* ]]; then
    echo -e "${RED}❌ Invalid connection string format. Please try again.${NC}"
    exit 1
fi

# Replace placeholders in connection string
CONNECTION_STRING=${CONNECTION_STRING//<username>/$DB_USERNAME}
CONNECTION_STRING=${CONNECTION_STRING//<password>/$DB_PASSWORD}

# Add database name if not present
if [[ $CONNECTION_STRING != *"/mini-games-platform"* ]]; then
    CONNECTION_STRING=${CONNECTION_STRING//?retryWrites/mini-games-platform?retryWrites}
fi

echo ""
echo -e "${YELLOW}📝 Step 6: Updating .env File${NC}"

# Backup original .env
cp backend/.env backend/.env.backup

# Update .env file
sed -i.bak "s|MONGODB_URI=.*|MONGODB_URI=$CONNECTION_STRING|" backend/.env

echo -e "${GREEN}✅ Updated backend/.env file${NC}"
echo "   Backup saved as backend/.env.backup"
echo ""

echo -e "${BLUE}🧪 Testing Connection...${NC}"
cd backend

# Test connection
if npm run setup-atlas; then
    echo ""
    echo -e "${GREEN}🎉 SUCCESS! MongoDB Atlas is configured correctly!${NC}"
    echo ""
    echo -e "${BLUE}📊 Next Steps:${NC}"
    echo "   1. Seed your database:"
    echo "      cd backend && npm run seed"
    echo ""
    echo "   2. Start your application:"
    echo "      cd backend && npm start"
    echo "      cd frontend && npm run dev"
    echo ""
    echo "   3. Open your browser:"
    echo "      http://localhost:5173"
    echo ""
    
    read -p "Would you like to seed the database now? (y/n): " SEED_DB
    if [[ $SEED_DB == "y" || $SEED_DB == "Y" ]]; then
        echo ""
        echo -e "${BLUE}🌱 Seeding database...${NC}"
        npm run seed
        echo ""
        echo -e "${GREEN}✅ Database seeded successfully!${NC}"
    fi
    
else
    echo ""
    echo -e "${RED}❌ Connection test failed!${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Troubleshooting:${NC}"
    echo "   1. Check your username and password"
    echo "   2. Verify network access is configured"
    echo "   3. Ensure your cluster is running"
    echo "   4. Check for special characters in password (may need URL encoding)"
    echo ""
    echo "See COMPLETE_ATLAS_SETUP.md for detailed troubleshooting"
    
    # Restore backup
    mv backend/.env.backup backend/.env
    echo "   Restored original .env file"
fi

echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "   - COMPLETE_ATLAS_SETUP.md - Full setup guide"
echo "   - ATLAS_CONFIGURATION_STEPS.md - Quick reference"
echo "   - MONGODB_ATLAS_SETUP.md - Detailed Atlas guide"
echo ""
echo -e "${GREEN}Happy Gaming! 🎮${NC}"