# Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Forward Africa Learning Platform to production environments.

## Prerequisites

### Required Accounts
- **Supabase Account**: For backend services
- **Netlify Account**: For frontend hosting (recommended)
- **Domain Provider**: For custom domain setup
- **CDN Provider**: For asset optimization (optional)

### Required Tools
- Node.js 18+ and npm
- Git
- Supabase CLI (optional)
- Netlify CLI (optional)

## Environment Setup

### Production Environment Variables

Create a `.env.production` file with the following variables:

```env
# Firebase configuration and production variables. See FIREBASE_MIGRATION_GUIDE.md for required keys.
# Application Configuration
VITE_APP_NAME=Forward Africa
VITE_APP_URL=https://forwardafrica.com
VITE_APP_VERSION=1.0.0

# Analytics (Optional)
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
VITE_HOTJAR_ID=your-hotjar-id

# Error Tracking (Optional)
VITE_SENTRY_DSN=your-sentry-dsn

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_CHAT_SUPPORT=true
```

### Security Environment Variables

```env
# Security Configuration
VITE_ENABLE_CSP=true
VITE_ALLOWED_ORIGINS=https://forwardafrica.com,https://www.forwardafrica.com
VITE_API_RATE_LIMIT=1000
```

## Backend (Firestore) Setup

This project has migrated from Supabase to Firebase. Please follow FIREBASE_MIGRATION_GUIDE.md for full production setup instructions (Firestore, Firebase Auth, Firebase Storage, and Cloud Functions).

Key reminders:

- Set up a Firebase project and enable Firestore, Authentication, and Storage.
- Configure OAuth providers (e.g., Google) in the Firebase Console.
- Deploy Cloud Functions for server-side tasks (certificate generation, emails, AI assistant).
- Use the Firestore security rules and Storage rules to enforce access control.

For migration steps and data import, see FIREBASE_MIGRATION_GUIDE.md.

## Frontend Build and Optimization

### 1. Production Build

```bash
# Install dependencies
npm ci --production

# Run production build
npm run build

# Verify build output
ls -la dist/
```

### 2. Build Optimization

Update `vite.config.ts` for production:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { splitVendorChunkPlugin } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
          'pdf-vendor': ['jspdf'],
          'chart-vendor': ['recharts']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false, // Disable in production for security
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});
```

### 3. Asset Optimization

```bash
# Optimize images (if using local images)
npm install -g imagemin-cli
imagemin src/assets/images/* --out-dir=dist/assets/images

# Generate service worker for caching
npm install -g workbox-cli
workbox generateSW workbox-config.js
```

## Netlify Deployment

### 1. Site Configuration

Create `netlify.toml` in project root:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 2. Deploy via Git

```bash
# Connect to Netlify
netlify login
netlify init

# Deploy
git add .
git commit -m "Production deployment"
git push origin main

# Or deploy directly
netlify deploy --prod --dir=dist
```

### 3. Environment Variables

Set environment variables in Netlify dashboard:
- Go to Site settings > Environment variables
- Add all production environment variables
- Ensure sensitive keys are properly secured

### 4. Custom Domain Setup

1. **Add Domain**:
   - Go to Domain settings in Netlify
   - Add your custom domain
   - Configure DNS records

2. **SSL Certificate**:
   - Netlify automatically provisions SSL
   - Verify HTTPS is working
   - Set up HSTS headers

## Alternative Deployment Options

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
```

Create `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### AWS S3 + CloudFront

```bash
# Build the application
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Performance Optimization

### 1. CDN Configuration

Configure CDN for static assets:

```javascript
// Update asset URLs to use CDN
const CDN_URL = 'https://cdn.forwardafrica.com';

// In your build process
const assetUrlTransform = (url) => {
  if (process.env.NODE_ENV === 'production') {
    return `${CDN_URL}${url}`;
  }
  return url;
};
```

### 2. Caching Strategy

```javascript
// Service Worker for caching
const CACHE_NAME = 'forward-africa-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

### 3. Image Optimization

```javascript
// Responsive images with lazy loading
const ImageComponent = ({ src, alt, ...props }) => (
  <img
    src={src}
    alt={alt}
    loading="lazy"
    decoding="async"
    {...props}
  />
);
```

## Monitoring and Analytics

### 1. Error Tracking with Sentry

```bash
# Install Sentry
npm install @sentry/react @sentry/tracing
```

```javascript
// Configure Sentry
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: "production",
  tracesSampleRate: 0.1,
});
```

### 2. Performance Monitoring

```javascript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics service
  gtag('event', metric.name, {
    value: Math.round(metric.value),
    event_category: 'Web Vitals',
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### 3. Google Analytics

```javascript
// Google Analytics 4
import { gtag } from 'ga-gtag';

gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_ID, {
  page_title: document.title,
  page_location: window.location.href,
});
```

## Security Configuration

### 1. Content Security Policy

```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https: blob:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co;
  frame-src 'self' https://www.youtube.com;
">
```

### 2. Security Headers

Already configured in `netlify.toml` above.

### 3. Environment Security

```bash
# Audit dependencies
npm audit

# Update dependencies
npm update

# Check for vulnerabilities
npm audit fix
```

## Database Optimization

### 1. Indexing

```sql
-- Add performance indexes
CREATE INDEX CONCURRENTLY idx_courses_category_featured
ON courses(category, featured) WHERE NOT coming_soon;

CREATE INDEX CONCURRENTLY idx_user_progress_user_course
ON user_progress(user_id, course_id);

CREATE INDEX CONCURRENTLY idx_notifications_user_unread
ON notifications(user_id, read, created_at);
```

### 2. Connection Pooling

Configure in Supabase dashboard:
- Pool size: 15-25 connections
- Pool timeout: 30 seconds
- Idle timeout: 10 minutes

### 3. Query Optimization

```sql
-- Optimize common queries
EXPLAIN ANALYZE SELECT
  c.id, c.title, c.thumbnail, f.name as facilitator_name
FROM courses c
LEFT JOIN facilitators f ON c.facilitator_id = f.id
WHERE c.featured = true
ORDER BY c.created_at DESC
LIMIT 10;
```

## Backup and Recovery

### 1. Database Backups

Supabase provides automated backups:
- Daily backups retained for 7 days
- Weekly backups retained for 4 weeks
- Monthly backups retained for 3 months

### 2. Application Backups

```bash
# Backup application code
git tag v1.0.0
git push origin v1.0.0

# Backup environment configuration
cp .env.production .env.production.backup
```

### 3. Recovery Procedures

1. **Database Recovery**:
   - Use Supabase dashboard for point-in-time recovery
   - Restore from specific backup if needed

2. **Application Recovery**:
   - Rollback to previous Git tag
   - Redeploy from stable branch

## Maintenance

### 1. Regular Updates

```bash
# Weekly dependency updates
npm update
npm audit fix

# Monthly security updates
npm audit
npm install package@latest
```

### 2. Performance Monitoring

- Monitor Core Web Vitals
- Track error rates
- Monitor API response times
- Check database performance

### 3. Health Checks

```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.VITE_APP_VERSION
  });
});
```

## Scaling Considerations

### 1. Database Scaling

- Monitor connection usage
- Consider read replicas for heavy read workloads
- Implement query caching
- Optimize slow queries

### 2. CDN Scaling

- Use global CDN for static assets
- Implement edge caching
- Optimize image delivery

### 3. Application Scaling

- Implement code splitting
- Use lazy loading for routes
- Optimize bundle sizes
- Consider server-side rendering for SEO

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Node.js version compatibility
   - Verify environment variables
   - Clear npm cache: `npm cache clean --force`

2. **Deployment Issues**:
   - Verify DNS configuration
   - Check SSL certificate status
   - Validate environment variables

3. **Performance Issues**:
   - Analyze bundle size
   - Check for memory leaks
   - Monitor API response times

### Debug Tools

```bash
# Analyze bundle size
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/assets

# Check lighthouse scores
npm install -g lighthouse
lighthouse https://forwardafrica.com --output html
```

## Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test user authentication flow
- [ ] Confirm video playback works
- [ ] Test course enrollment and progress
- [ ] Verify certificate generation
- [ ] Check mobile responsiveness
- [ ] Test admin functionality
- [ ] Confirm analytics tracking
- [ ] Verify error tracking
- [ ] Test backup procedures
- [ ] Monitor performance metrics
- [ ] Check security headers
- [ ] Verify SSL certificate
- [ ] Test email notifications
- [ ] Confirm database connections

---

This production deployment guide provides comprehensive instructions for deploying the Forward Africa Learning Platform to a production environment with proper security, performance, and monitoring configurations.
