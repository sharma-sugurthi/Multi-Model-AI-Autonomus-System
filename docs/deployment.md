# Deployment Guide

## Prerequisites

- Node.js 18 or later
- Docker and Docker Compose
- Redis server
- LangFlow API endpoint

## Environment Setup

1. **Environment Variables**
   Create a `.env` file with the following variables:
   ```env
   # LangFlow API
   LANGFLOW_API_URL=http://your-langflow-api:7860
   LANGFLOW_API_KEY=your-api-key

   # Redis
   REDIS_URL=redis://localhost:6379

   # Cron Jobs
   CRON_JOBS_FILE=/path/to/cron-jobs.json

   # API Configuration
   API_RATE_LIMIT=100
   API_TIMEOUT=30000
   ```

2. **Docker Configuration**
   Create a `docker-compose.yml` file:
   ```yaml
   version: '3.8'

   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - LANGFLOW_API_URL=${LANGFLOW_API_URL}
         - LANGFLOW_API_KEY=${LANGFLOW_API_KEY}
         - REDIS_URL=${REDIS_URL}
         - CRON_JOBS_FILE=${CRON_JOBS_FILE}
       volumes:
         - ./cron-jobs.json:/app/cron-jobs.json
       depends_on:
         - redis

     redis:
       image: redis:alpine
       ports:
         - "6379:6379"
       volumes:
         - redis-data:/data

   volumes:
     redis-data:
   ```

## Building the Application

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build the Application**
   ```bash
   npm run build
   ```

3. **Build Docker Image**
   ```bash
   docker build -t workflow-orchestration .
   ```

## Deployment Steps

1. **Local Deployment**
   ```bash
   # Start the application
   npm start

   # Or using Docker Compose
   docker-compose up -d
   ```

2. **Production Deployment**
   ```bash
   # Build and start containers
   docker-compose -f docker-compose.prod.yml up -d

   # Monitor logs
   docker-compose -f docker-compose.prod.yml logs -f
   ```

3. **Scaling**
   ```bash
   # Scale the application
   docker-compose -f docker-compose.prod.yml up -d --scale app=3
   ```

## Monitoring

1. **Health Checks**
   - Endpoint: `/api/health`
   - Checks:
     - API connectivity
     - Redis connection
     - Cron job status

2. **Logging**
   - Application logs
   - Error tracking
   - Performance metrics

3. **Metrics**
   - Request rates
   - Response times
   - Error rates
   - Resource usage

## Backup and Recovery

1. **Data Backup**
   ```bash
   # Backup Redis data
   docker exec redis redis-cli SAVE
   docker cp redis:/data/dump.rdb ./backup/

   # Backup cron jobs
   cp cron-jobs.json ./backup/
   ```

2. **Recovery**
   ```bash
   # Restore Redis data
   docker cp ./backup/dump.rdb redis:/data/
   docker exec redis redis-cli BGREWRITEAOF

   # Restore cron jobs
   cp ./backup/cron-jobs.json ./
   ```

## Security

1. **SSL/TLS**
   - Configure SSL certificates
   - Enable HTTPS
   - Set up secure headers

2. **Firewall**
   - Configure firewall rules
   - Restrict access to ports
   - Set up VPN if needed

3. **Authentication**
   - Set up API keys
   - Configure JWT
   - Implement rate limiting

## Maintenance

1. **Updates**
   ```bash
   # Pull latest changes
   git pull

   # Rebuild and restart
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

2. **Cleanup**
   ```bash
   # Remove old containers
   docker-compose -f docker-compose.prod.yml down

   # Clean up volumes
   docker volume prune
   ```

3. **Monitoring**
   - Set up alerts
   - Monitor resource usage
   - Track error rates

## Troubleshooting

1. **Common Issues**
   - Connection problems
   - Performance issues
   - Memory leaks
   - Disk space

2. **Debugging**
   ```bash
   # View logs
   docker-compose -f docker-compose.prod.yml logs -f

   # Check container status
   docker-compose -f docker-compose.prod.yml ps

   # Access container shell
   docker-compose -f docker-compose.prod.yml exec app sh
   ```

3. **Recovery Steps**
   - Check logs
   - Verify configurations
   - Restart services
   - Restore from backup

## Performance Optimization

1. **Caching**
   - Configure Redis caching
   - Set cache policies
   - Monitor cache hit rates

2. **Load Balancing**
   - Set up load balancer
   - Configure health checks
   - Monitor traffic

3. **Resource Management**
   - Set resource limits
   - Monitor usage
   - Scale as needed

## Disaster Recovery

1. **Backup Strategy**
   - Regular backups
   - Offsite storage
   - Test restores

2. **Recovery Plan**
   - Document procedures
   - Test recovery
   - Update regularly

3. **High Availability**
   - Multiple instances
   - Load balancing
   - Failover configuration 