# 🚀 BeamCut Deployment Guide

This guide covers multiple deployment options for your BeamCut optimization application.

## 📋 Prerequisites

Before deploying, ensure you have:
- A GitHub repository with your code
- A Neon Database account (for PostgreSQL)
- Environment variables configured

## 🎯 Option 1: Railway (Recommended - Easiest)

### Step 1: Set up Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your BeamCut repository

### Step 2: Configure Environment Variables
In Railway dashboard, add these environment variables:
```env
DATABASE_URL=your_neon_database_url
NODE_ENV=production
PORT=5000
```

### Step 3: Deploy
1. Railway will automatically detect your configuration
2. It will install Node.js and Python dependencies
3. Build and deploy your application
4. Your app will be available at the provided URL

**Cost**: Free tier available, then $5/month for basic plan

---

## 🐳 Option 2: Render

### Step 1: Set up Render
1. Go to [render.com](https://render.com)
2. Sign up and connect your GitHub account
3. Click "New" → "Web Service"
4. Connect your repository

### Step 2: Configure Service
- **Name**: beamcut-optimization
- **Environment**: Node
- **Build Command**: `npm install && pip install -r requirements.txt && npm run build`
- **Start Command**: `npm start`

### Step 3: Environment Variables
Add these in Render dashboard:
```env
DATABASE_URL=your_neon_database_url
NODE_ENV=production
PORT=5000
```

**Cost**: Free tier available, then $7/month

---

## ☁️ Option 3: Heroku

### Step 1: Install Heroku CLI
```bash
# Windows
winget install --id=Heroku.HerokuCLI

# Or download from https://devcenter.heroku.com/articles/heroku-cli
```

### Step 2: Deploy
```bash
# Login to Heroku
heroku login

# Create app
heroku create your-beamcut-app

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Open app
heroku open
```

**Cost**: No free tier anymore, starts at $5/month

---

## 🐙 Option 4: DigitalOcean App Platform

### Step 1: Set up DigitalOcean
1. Go to [digitalocean.com](https://digitalocean.com)
2. Create account and add payment method
3. Go to "Apps" → "Create App"

### Step 2: Configure App
- **Source**: Connect GitHub repository
- **Environment**: Docker
- **Resources**: Basic plan ($5/month)

### Step 3: Environment Variables
Add in DigitalOcean dashboard:
```env
DATABASE_URL=your_neon_database_url
NODE_ENV=production
PORT=5000
```

**Cost**: $5/month

---

## 🔧 Environment Variables Setup

### Required Variables
```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# Application
NODE_ENV=production
PORT=5000
```

### Optional Variables
```env
# For additional features
SESSION_SECRET=your_session_secret_here
CORS_ORIGIN=https://yourdomain.com
```

---

## 🗄️ Database Setup

### Using Neon Database (Recommended)
1. Go to [neon.tech](https://neon.tech)
2. Create account and new project
3. Copy the connection string
4. Add to your environment variables

### Database Migration
After deployment, run:
```bash
npm run db:push
```

---

## 🔍 Troubleshooting

### Common Issues

1. **Python not found**
   - Ensure Python 3.11+ is installed
   - Check `requirements.txt` exists

2. **Database connection failed**
   - Verify `DATABASE_URL` is correct
   - Check if database is accessible

3. **Build fails**
   - Check Node.js version (20+ required)
   - Verify all dependencies are listed

4. **Port issues**
   - Ensure `PORT` environment variable is set
   - Check if port is available

### Logs
Check deployment logs in your platform's dashboard for specific errors.

---

## 📊 Performance Optimization

### Production Build
```bash
npm run build
```

### Environment Optimization
- Set `NODE_ENV=production`
- Use production database
- Enable compression
- Set up CDN for static assets

---

## 🔒 Security Considerations

1. **Environment Variables**: Never commit secrets to Git
2. **Database**: Use connection pooling
3. **HTTPS**: Enable SSL/TLS
4. **CORS**: Configure allowed origins
5. **Rate Limiting**: Implement API rate limits

---

## 📈 Monitoring

### Recommended Tools
- **Railway**: Built-in monitoring
- **Render**: Application logs
- **Heroku**: Heroku Metrics
- **DigitalOcean**: App Platform monitoring

### Health Checks
Your app includes health check endpoint at `/` for monitoring.

---

## 🚀 Next Steps

After deployment:
1. Test all functionality
2. Set up custom domain (optional)
3. Configure SSL certificate
4. Set up monitoring and alerts
5. Create backup strategy

---

## 💰 Cost Comparison

| Platform | Free Tier | Paid Plans | Ease of Use |
|----------|-----------|------------|-------------|
| Railway | ✅ | $5/month | ⭐⭐⭐⭐⭐ |
| Render | ✅ | $7/month | ⭐⭐⭐⭐ |
| Heroku | ❌ | $5/month | ⭐⭐⭐ |
| DigitalOcean | ❌ | $5/month | ⭐⭐⭐ |

**Recommendation**: Start with Railway for the easiest deployment experience! 