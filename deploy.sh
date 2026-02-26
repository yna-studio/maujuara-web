#!/bin/bash

# Production Deployment Script for Maijuara Web
set -e  # Exit on any error

echo "🚀 Starting Maijuara Web deployment..."

# Stop existing PM2 process
echo "🛑 Stopping PM2 process..."
cd /root
pm2 stop mjur-web || echo "PM2 process not running, continuing..."

# Clone fresh repository (no git history)
echo "📥 Cloning fresh repository..."
rm -rf /root/apps/maujuara.com
git clone --depth 1 git@github.com:yna-studio/maujuara-web.git /root/apps/maujuara.com

# Move to app directory
echo "📁 Moving to app directory..."
cd /root/apps/maujuara.com

# Create .env file
echo "⚙️ Creating environment file..."
cat > .env << EOF
PUBLIC_HOST=https://maujuara.com
MONGODB_HOST=mongodb+srv://maujuara.kef0kb5.mongodb.net
MONGODB_NAME=maujuara
MONGODB_USER=webdev
MONGODB_PASSWORD=Rahasia20
TELEGRAM_MJUR_TOKEN=8591152741:AAE8DMuOPC3ffuv-GCVq3eHT5ro-OwTAoV4
CLOUDINARY_DIR=/maujuara
CLOUDINARY_CLOUD_NAME=dhjkktmal
CLOUDINARY_API_KEY=546653438788785
CLOUDINARY_API_SECRET=pAtLP1NVgyxcSKzG68eCH-RcbWw
EOF

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build application
echo "🔨 Building application..."
pnpm build

# Start PM2 process
echo "🚀 Starting PM2 process..."
pm2 start mjur-web

echo "✅ Deployment completed successfully!"
echo "🌐 App is running at: https://maujuara.com"
