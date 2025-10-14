#!/bin/bash

# Build script for Vercel deployment
echo "🔧 Starting build process..."

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Build CSS with Tailwind
echo "🎨 Building CSS with Tailwind..."
npx tailwindcss -i static/src/input.css -o static/dist/output.css --minify

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

echo "✅ Build process completed!"
