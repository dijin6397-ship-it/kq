#!/bin/bash

set -e

echo "=========================================="
echo "  智勤考勤 - 一键部署脚本"
echo "=========================================="

# 检查 Docker 和 Docker Compose
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "Error: Docker Compose is not installed"
    exit 1
fi

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "Please edit .env file with your configuration"
    exit 1
fi

# 加载环境变量
source .env

echo "Step 1: Building and starting containers..."
docker compose up -d --build

echo "Step 2: Waiting for MySQL to be ready..."
sleep 10

echo "Step 3: Running database migrations..."
docker compose exec -T backend npx prisma migrate deploy

echo "Step 4: Seeding database (optional)..."
read -p "Do you want to seed the database with initial data? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker compose exec -T backend npx prisma db seed
fi

echo "Step 5: Building admin frontend..."
if [ -d "admin" ]; then
    cd admin
    npm install
    npm run build
    cd ..
fi

echo "=========================================="
echo "  Deployment completed!"
echo "=========================================="
echo ""
echo "Services:"
echo "  - Backend API: http://localhost/api"
echo "  - Admin Panel: http://localhost/admin"
echo "  - Nginx:       http://localhost"
echo ""
echo "Useful commands:"
echo "  docker compose logs -f backend  # View backend logs"
echo "  docker compose exec backend sh  # Shell into backend container"
echo "  docker compose restart backend  # Restart backend"
echo "  docker compose down             # Stop all services"
echo "=========================================="