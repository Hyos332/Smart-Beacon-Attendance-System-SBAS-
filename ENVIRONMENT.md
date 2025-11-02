# 🔧 Development Setup

## Environment Configuration

1. **Copy environment example files:**
   ```bash
   cp sbas/frontend/.env.example sbas/frontend/.env
   cp sbas/webapp_student/.env.example sbas/webapp_student/.env
   cp sbas/backend/.env.example sbas/backend/.env
   ```

2. **Update .env files with your local values**

3. **Run development environment:**
   ```bash
   docker-compose up --build
   ```

## 🚀 Production Deployment

### Environment Variables Required

#### Frontend (Teacher Dashboard)
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_ENV`: production
- `REACT_APP_SCHOOL_NAME`: Your school name
- `REACT_APP_ADMIN_EMAIL`: Admin contact email

#### Student App  
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_ENV`: production
- `REACT_APP_BEACON_ID`: Bluetooth beacon identifier
- `REACT_APP_SERVICE_UUID`: Bluetooth service UUID

#### Backend
- `NODE_ENV`: production
- `PORT`: Server port (usually 5000)
- `CORS_ORIGINS`: Allowed frontend URLs
- `BEACON_UUID`: Bluetooth beacon UUID
- `JWT_SECRET`: Secret for JWT tokens
- `ADMIN_PASSWORD`: Admin authentication password

## 🔒 Security

- Never commit `.env` files to the repository
- Use `.env.example` files as templates
- Configure environment variables directly in deployment platforms
- Rotate secrets regularly in production