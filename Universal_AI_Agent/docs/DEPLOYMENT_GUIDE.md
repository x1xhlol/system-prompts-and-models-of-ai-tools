# Universal AI Agent - Complete Deployment Guide

## Table of Contents

1. [Quick Start](#quick-start)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [Kubernetes Production Deployment](#kubernetes-production-deployment)
5. [Cloud Platform Deployment](#cloud-platform-deployment)
6. [Mobile App Setup](#mobile-app-setup)
7. [Monitoring and Analytics](#monitoring-and-analytics)
8. [Security Configuration](#security-configuration)
9. [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Redis (optional, for caching)
- PostgreSQL (optional, for persistence)

### 1-Minute Setup

```bash
# Clone and setup
git clone <repository-url>
cd Universal_AI_Agent

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start with Docker
docker-compose up -d

# Access the application
open http://localhost:8787
```

## Local Development

### Environment Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Configure Environment Variables**

   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Edit .env file with your configuration
   nano .env
   ```

3. **Required Environment Variables**

   ```env
   # Core Configuration
   PORT=8787
   NODE_ENV=development
   
   # AI Provider Keys
   OPENAI_API_KEY=your_openai_key_here
   ANTHROPIC_API_KEY=your_anthropic_key_here
   
   # Azure Speech (for voice features)
   AZURE_SPEECH_KEY=your_azure_speech_key
   AZURE_SPEECH_REGION=your_azure_region
   
   # Database URLs (optional)
   REDIS_URL=redis://localhost:6379
   POSTGRES_URL=postgres://user:password@localhost:5432/agent
   
   # Security
   AUTH_TOKEN=your_secure_bearer_token
   JWT_SECRET=your_jwt_secret_key
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX=100
   
   # Feature Flags
   ALLOW_WEB_FETCH=true
   ALLOW_GIT_INFO=true
   ALLOW_FS_READ=true
   ALLOW_POWERSHELL=false
   LOG_JSON=true
   ```

4. **Start Development Server**

   ```bash
   npm run dev
   ```

### Development Features

- **Hot Reload**: Server automatically restarts on file changes
- **Debug Mode**: Detailed logging and error traces
- **Memory Persistence**: File-based memory for development
- **Plugin Development**: Hot-reload plugins without restart

## Docker Deployment

### Single Container

```bash
# Build the image
docker build -t universal-ai-agent .

# Run with environment file
docker run -d \
  --name ai-agent \
  --env-file .env \
  -p 8787:8787 \
  -v $(pwd)/memory:/app/memory \
  universal-ai-agent
```

### Full Stack with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale the application
docker-compose up -d --scale app=3

# Stop all services
docker-compose down
```

### Docker Compose Configuration

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8787:8787"
    environment:
      - REDIS_URL=redis://redis:6379
      - POSTGRES_URL=postgres://postgres:postgres@postgres:5432/agent
    depends_on:
      - redis
      - postgres
    volumes:
      - ./memory:/app/memory
      - ./logs:/app/logs

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: agent
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  redis_data:
  postgres_data:
```

## Kubernetes Production Deployment

### Prerequisites

- Kubernetes cluster (1.20+)
- kubectl configured
- Ingress controller (nginx recommended)
- cert-manager for SSL certificates

### 1. Create Namespace

```bash
kubectl create namespace ai-agent
```

### 2. Create Secrets

```bash
# AI API Keys
kubectl create secret generic ai-keys \
  --from-literal=openai-key=your_openai_key \
  --from-literal=anthropic-key=your_anthropic_key \
  --from-literal=azure-speech-key=your_azure_key \
  --from-literal=azure-speech-region=your_region \
  -n ai-agent

# Database Connection
kubectl create secret generic postgres-secret \
  --from-literal=connection-string=postgres://user:pass@postgres:5432/agent \
  -n ai-agent

# Authentication
kubectl create secret generic auth-secret \
  --from-literal=bearer-token=your_secure_token \
  --from-literal=jwt-secret=your_jwt_secret \
  -n ai-agent
```

### 3. Deploy Infrastructure

```bash
# Deploy Redis
kubectl apply -f k8s/redis.yaml -n ai-agent

# Deploy PostgreSQL
kubectl apply -f k8s/postgres.yaml -n ai-agent

# Wait for databases to be ready
kubectl wait --for=condition=ready pod -l app=redis -n ai-agent --timeout=300s
kubectl wait --for=condition=ready pod -l app=postgres -n ai-agent --timeout=300s
```

### 4. Deploy Application

```bash
# Deploy the main application
kubectl apply -f k8s/deployment.yaml -n ai-agent

# Check deployment status
kubectl get pods -n ai-agent
kubectl logs -f deployment/universal-ai-agent -n ai-agent
```

### 5. Configure Ingress

```bash
# Update the ingress with your domain
sed -i 's/ai-agent.yourdomain.com/your-actual-domain.com/g' k8s/deployment.yaml

# Apply ingress configuration
kubectl apply -f k8s/deployment.yaml -n ai-agent

# Check ingress status
kubectl get ingress -n ai-agent
```

### 6. Monitor Deployment

```bash
# Check all resources
kubectl get all -n ai-agent

# View application logs
kubectl logs -f deployment/universal-ai-agent -n ai-agent

# Check horizontal pod autoscaler
kubectl get hpa -n ai-agent
```

## Cloud Platform Deployment

### AWS EKS

```bash
# Create EKS cluster
eksctl create cluster --name ai-agent-cluster --region us-west-2

# Configure kubectl
aws eks update-kubeconfig --region us-west-2 --name ai-agent-cluster

# Deploy application
kubectl apply -f k8s/ -n ai-agent
```

### Google GKE

```bash
# Create GKE cluster
gcloud container clusters create ai-agent-cluster \
  --zone us-central1-a \
  --num-nodes 3

# Get credentials
gcloud container clusters get-credentials ai-agent-cluster --zone us-central1-a

# Deploy application
kubectl apply -f k8s/ -n ai-agent
```

### Azure AKS

```bash
# Create resource group
az group create --name ai-agent-rg --location eastus

# Create AKS cluster
az aks create \
  --resource-group ai-agent-rg \
  --name ai-agent-cluster \
  --node-count 3 \
  --enable-addons monitoring \
  --generate-ssh-keys

# Get credentials
az aks get-credentials --resource-group ai-agent-rg --name ai-agent-cluster

# Deploy application
kubectl apply -f k8s/ -n ai-agent
```

### Serverless Deployment

#### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
```

#### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=.

# Configure environment variables in Netlify dashboard
```

## Mobile App Setup

### React Native Setup

1. **Prerequisites**

   ```bash
   # Install React Native CLI
   npm install -g react-native-cli
   
   # For iOS development (macOS only)
   sudo gem install cocoapods
   
   # For Android development
   # Install Android Studio and configure SDK
   ```

2. **Initialize Project**

   ```bash
   # Create new React Native project
   npx react-native init UniversalAIAgent
   cd UniversalAIAgent
   
   # Copy the mobile app code
   cp ../mobile/react-native-app.js App.js
   
   # Install dependencies
   npm install @react-native-async-storage/async-storage
   npm install @react-native-netinfo/netinfo
   npm install @react-native-voice/voice
   npm install expo-av
   ```

3. **Configure API Endpoints**

   ```javascript
   // Update API_BASE_URL in App.js
   const API_BASE_URL = 'https://your-deployed-domain.com';
   const WS_URL = 'wss://your-deployed-domain.com';
   ```

4. **Build and Run**

   ```bash
   # For iOS
   npx react-native run-ios
   
   # For Android
   npx react-native run-android
   ```

### Flutter Alternative

```bash
# Create Flutter project
flutter create universal_ai_agent
cd universal_ai_agent

# Add dependencies to pubspec.yaml
flutter pub add http
flutter pub add web_socket_channel
flutter pub add shared_preferences
flutter pub add speech_to_text

# Run the app
flutter run
```

## Monitoring and Analytics

### Built-in Analytics Dashboard

Access the analytics dashboard at: `https://your-domain.com/analytics`

Features:

- Real-time metrics
- Performance monitoring
- User analytics
- Cost tracking
- System health

### External Monitoring

#### Prometheus + Grafana

```bash
# Deploy monitoring stack
kubectl apply -f monitoring/prometheus.yaml
kubectl apply -f monitoring/grafana.yaml

# Access Grafana dashboard
kubectl port-forward svc/grafana 3000:3000
```

#### DataDog Integration

```javascript
// Add to server.js
import { StatsD } from 'node-statsd';
const statsd = new StatsD();

// Track metrics
statsd.increment('requests.total');
statsd.timing('response.time', responseTime);
```

## Security Configuration

### SSL/TLS Setup

#### Let's Encrypt with cert-manager

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
kubectl apply -f k8s/cert-issuer.yaml
```

### Authentication Options

#### JWT Authentication

```env
AUTH_TOKEN=your_bearer_token
JWT_SECRET=your_jwt_secret_256_bit
```

#### OAuth Integration

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### Security Best Practices

1. **Environment Variables**: Never commit secrets to version control
2. **Rate Limiting**: Configure appropriate limits for your use case
3. **CORS**: Configure CORS for your domain
4. **Input Validation**: Enable strict input validation
5. **Monitoring**: Set up security monitoring and alerts

## Troubleshooting

### Common Issues

#### 1. Application Won't Start

```bash
# Check logs
docker-compose logs app

# Common causes:
# - Missing environment variables
# - Database connection issues
# - Port conflicts
```

#### 2. Database Connection Errors

```bash
# Test Redis connection
redis-cli -h localhost -p 6379 ping

# Test PostgreSQL connection
psql -h localhost -p 5432 -U postgres -d agent
```

#### 3. High Memory Usage

```bash
# Monitor memory usage
docker stats

# Restart if needed
docker-compose restart app
```

#### 4. SSL Certificate Issues

```bash
# Check certificate status
kubectl describe certificate ai-agent-tls -n ai-agent

# Force certificate renewal
kubectl delete certificate ai-agent-tls -n ai-agent
kubectl apply -f k8s/deployment.yaml -n ai-agent
```

### Performance Optimization

#### 1. Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_timestamp ON conversations(timestamp);
CREATE INDEX idx_vector_embeddings ON documents USING ivfflat (embedding vector_cosine_ops);
```

#### 2. Caching Strategy

```javascript
// Configure Redis caching
const cacheConfig = {
  conversations: 3600, // 1 hour
  embeddings: 86400,   // 24 hours
  responses: 1800      // 30 minutes
};
```

#### 3. Load Balancing

```yaml
# Update deployment for multiple replicas
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2
      maxUnavailable: 1
```

### Health Checks

#### Application Health

```bash
# Health check endpoint
curl https://your-domain.com/health

# Expected response:
{
  "status": "healthy",
  "uptime": 3600,
  "memory": "512MB",
  "connections": {
    "redis": "connected",
    "postgres": "connected"
  }
}
```

#### Kubernetes Health

```bash
# Check pod health
kubectl get pods -n ai-agent

# Check service endpoints
kubectl get endpoints -n ai-agent

# Check ingress status
kubectl describe ingress ai-agent-ingress -n ai-agent
```

## Support and Maintenance

### Backup Strategy

```bash
# Database backups
kubectl exec -it postgres-pod -- pg_dump -U postgres agent > backup.sql

# Redis backup
kubectl exec -it redis-pod -- redis-cli BGSAVE
```

### Updates and Upgrades

```bash
# Update application
docker build -t universal-ai-agent:v2.0.0 .
kubectl set image deployment/universal-ai-agent ai-agent=universal-ai-agent:v2.0.0 -n ai-agent

# Monitor rollout
kubectl rollout status deployment/universal-ai-agent -n ai-agent
```

### Scaling Guidelines

- **CPU**: Scale up when CPU usage > 70%
- **Memory**: Scale up when memory usage > 80%
- **Response Time**: Scale up when avg response time > 2 seconds
- **Queue Length**: Scale up when request queue > 100

For additional support, please refer to the [API Documentation](API_REFERENCE.md) and [Plugin Development Guide](PLUGIN_DEVELOPMENT.md).
