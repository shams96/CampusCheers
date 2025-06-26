#!/bin/bash

# Campus Cheers Deployment Script
# This script helps deploy the app to various platforms

set -e

echo "🎉 Campus Cheers Deployment Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Function to build the app
build_app() {
    echo "🔨 Building the application..."
    npm run build
    echo "✅ Build completed successfully!"
}

# Function to deploy to Vercel
deploy_vercel() {
    echo "🚀 Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        echo "📦 Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    vercel --prod
    echo "✅ Deployed to Vercel successfully!"
}

# Function to deploy to Netlify
deploy_netlify() {
    echo "🚀 Deploying to Netlify..."
    
    if ! command -v netlify &> /dev/null; then
        echo "📦 Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    # Build the app first
    build_app
    
    # Deploy to Netlify
    netlify deploy --prod --dir=out
    echo "✅ Deployed to Netlify successfully!"
}

# Function to create Docker image
create_docker() {
    echo "🐳 Creating Docker image..."
    
    # Build the app
    build_app
    
    # Build Docker image
    docker build -t campus-cheers .
    echo "✅ Docker image created successfully!"
}

# Function to run locally
run_local() {
    echo "🏠 Starting local development server..."
    npm run dev
}

# Function to run production locally
run_production() {
    echo "🏠 Starting production server locally..."
    build_app
    npm start
}

# Function to run tests
run_tests() {
    echo "🧪 Running tests..."
    npm run test
    echo "✅ Tests completed!"
}

# Function to check code quality
check_quality() {
    echo "🔍 Checking code quality..."
    npm run lint
    npm run type-check
    echo "✅ Code quality checks passed!"
}

# Main menu
show_menu() {
    echo ""
    echo "Choose an option:"
    echo "1) Build app"
    echo "2) Deploy to Vercel"
    echo "3) Deploy to Netlify"
    echo "4) Create Docker image"
    echo "5) Run locally (development)"
    echo "6) Run locally (production)"
    echo "7) Run tests"
    echo "8) Check code quality"
    echo "9) Full deployment (build + test + deploy)"
    echo "0) Exit"
    echo ""
}

# Process user input
process_choice() {
    case $1 in
        1)
            build_app
            ;;
        2)
            deploy_vercel
            ;;
        3)
            deploy_netlify
            ;;
        4)
            create_docker
            ;;
        5)
            run_local
            ;;
        6)
            run_production
            ;;
        7)
            run_tests
            ;;
        8)
            check_quality
            ;;
        9)
            echo "🚀 Full deployment pipeline..."
            check_quality
            run_tests
            build_app
            deploy_vercel
            ;;
        0)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            ;;
    esac
}

# Check if argument was provided
if [ $# -eq 1 ]; then
    process_choice $1
else
    # Interactive mode
    while true; do
        show_menu
        read -p "Enter your choice (0-9): " choice
        process_choice $choice
        echo ""
        read -p "Press Enter to continue..."
    done
fi 