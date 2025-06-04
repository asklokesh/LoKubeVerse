#!/bin/bash

echo "🚀 K8s Dash - Quick Setup Script"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install Node.js and npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All requirements are met!${NC}"
echo ""

# Start backend services
echo -e "${BLUE}🔧 Starting backend services...${NC}"
docker compose up -d

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Install frontend dependencies
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
cd frontend
npm install

# Start frontend in background
echo -e "${BLUE}🎨 Starting frontend development server...${NC}"
npm run dev &

cd ..

echo ""
echo -e "${GREEN}✨ Setup complete!${NC}"
echo ""
echo "📋 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🔐 Demo credentials:"
echo "   Email: demo@k8sdash.com"
echo "   Password: demo123"
echo ""
echo "📖 To stop all services:"
echo "   docker compose down"
echo "   Kill the frontend process (or press Ctrl+C in the terminal)"
echo ""
echo -e "${BLUE}Happy coding! 🎉${NC}" 