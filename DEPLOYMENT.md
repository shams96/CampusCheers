# Campus Cheers Deployment Guide

This guide provides step-by-step instructions for deploying the Campus Cheers MVP to various platforms.

## 🚀 Quick Deploy Options

### 1. Vercel (Recommended - 2 minutes)

1. **Fork/Clone** this repository
2. **Connect** to [Vercel](https://vercel.com)
3. **Import** the repository
4. **Deploy** automatically

```bash
# Or deploy via CLI
npm install -g vercel
vercel --prod
```

### 2. Netlify (3 minutes)

1. **Fork/Clone** this repository
2. **Connect** to [Netlify](https://netlify.com)
3. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `out`
4. **Deploy**

### 3. Railway (3 minutes)

1. **Connect** repository to [Railway](https://railway.app)
2. **Auto-deploy** on push
3. **Environment variables** (if needed)

## 🏗️ Manual Deployment

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Step 1: Clone and Setup

```bash
git clone <repository-url>
cd campuscheers
npm install
```

### Step 2: Environment Configuration

Create `.env.local`:

```env
# Database (for production)
DATABASE_URL=your_database_url

# Push Notifications
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key

# Analytics (optional)
ANALYTICS_ID=your_analytics_id

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=Campus Cheers
```

### Step 3: Build and Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🐳 Docker Deployment

### Build Docker Image

```bash
# Build the image
docker build -t campus-cheers .

# Run the container
docker run -p 3000:3000 campus-cheers
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# Start development environment
docker-compose --profile dev up
```

## ☁️ Cloud Platform Deployment

### AWS (ECS/Fargate)

1. **Build and push** to ECR:
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker build -t campus-cheers .
docker tag campus-cheers:latest your-account.dkr.ecr.us-east-1.amazonaws.com/campus-cheers:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/campus-cheers:latest
```

2. **Deploy** to ECS Fargate
3. **Configure** load balancer and auto-scaling

### Google Cloud (Cloud Run)

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/your-project/campus-cheers
gcloud run deploy campus-cheers --image gcr.io/your-project/campus-cheers --platform managed
```

### Azure (Container Instances)

```bash
# Build and push to ACR
az acr build --registry your-registry --image campus-cheers .
az container create --resource-group your-rg --name campus-cheers --image your-registry.azurecr.io/campus-cheers
```

## 🔧 Production Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | Database connection string | Yes | - |
| `VAPID_PUBLIC_KEY` | Push notification public key | No | - |
| `VAPID_PRIVATE_KEY` | Push notification private key | No | - |
| `NEXT_PUBLIC_APP_URL` | App URL for PWA | Yes | `http://localhost:3000` |
| `NODE_ENV` | Environment | Yes | `production` |

### Performance Optimization

1. **Enable caching**:
```bash
# Add to next.config.js
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizeImages: true,
  },
  compress: true,
}
```

2. **Configure CDN** for static assets
3. **Enable compression** on your server
4. **Set up monitoring** (Sentry, LogRocket, etc.)

### Security Checklist

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] CORS properly set
- [ ] Rate limiting enabled
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection

## 📊 Monitoring & Analytics

### Health Checks

Add to your deployment:

```bash
# Health check endpoint
curl -f http://your-domain.com/api/health
```

### Performance Monitoring

1. **Vercel Analytics** (if using Vercel)
2. **Google Analytics** (optional)
3. **Sentry** for error tracking
4. **LogRocket** for session replay

### Logging

Configure structured logging:

```javascript
// Add to your app
import { logger } from './lib/logger'

logger.info('App started', { 
  environment: process.env.NODE_ENV,
  version: process.env.npm_package_version 
})
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Campus Cheers

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm run test

build:
  stage: build
  image: node:18
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - .next/

deploy:
  stage: deploy
  script:
    - echo "Deploy to production"
```

## 🚨 Troubleshooting

### Common Issues

1. **Build fails**:
   - Check Node.js version (18+)
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall

2. **PWA not working**:
   - Verify manifest.json exists
   - Check service worker registration
   - Ensure HTTPS in production

3. **Database connection**:
   - Verify DATABASE_URL format
   - Check network connectivity
   - Ensure database is accessible

4. **Push notifications**:
   - Verify VAPID keys
   - Check browser permissions
   - Test on HTTPS

### Debug Commands

```bash
# Check build output
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Test
npm run test

# Production build test
npm run build && npm start
```

## 📞 Support

- **Documentation**: [README.md](README.md)
- **Issues**: [GitHub Issues](https://github.com/campuscheers/issues)
- **Email**: support@campuscheers.com

---

**Happy Deploying! 🎉** 