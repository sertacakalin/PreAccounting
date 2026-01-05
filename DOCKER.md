# Docker Deployment Guide

This guide explains how to run the Pre-Accounting System using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+ installed
- Docker Compose V2+ installed
- At least 2GB of free disk space
- Ports 8081 and 3306 available

## Quick Start

### 1. Build and Start All Services

```bash
docker-compose up -d --build
```

This command will:
- Build the Spring Boot application Docker image
- Pull MySQL 8.0 image
- Create and start both containers
- Set up networking between services
- Create persistent volumes for data

### 2. Check Service Status

```bash
docker-compose ps
```

You should see both services running:
- `preaccounting-mysql` - MySQL database
- `preaccounting-app` - Spring Boot application

### 3. View Logs

```bash
# View all logs
docker-compose logs -f

# View application logs only
docker-compose logs -f app

# View MySQL logs only
docker-compose logs -f mysql
```

### 4. Access the Application

Once started, access the application at:
- **API**: http://localhost:8081
- **Swagger UI**: http://localhost:8081/swagger-ui.html
- **API Docs**: http://localhost:8081/v3/api-docs

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

## Docker Commands

### Stop Services

```bash
docker-compose down
```

### Stop and Remove All Data

```bash
docker-compose down -v
```

⚠️ **Warning**: This will delete all database data and uploaded files!

### Restart Services

```bash
docker-compose restart
```

### Rebuild Application (after code changes)

```bash
docker-compose up -d --build app
```

### View Container Details

```bash
# Get container shell (application)
docker exec -it preaccounting-app sh

# Get MySQL shell
docker exec -it preaccounting-mysql mysql -uroot -ppokok123 pre_accounting_db
```

## Docker Compose Services

### MySQL Database

- **Image**: mysql:8.0
- **Port**: 3306
- **Database**: pre_accounting_db
- **Root Password**: pokok123
- **Volume**: `mysql_data` (persistent storage)
- **Health Check**: Checks database availability every 10s

### Spring Boot Application

- **Build**: Multi-stage Dockerfile
- **Port**: 8081
- **Volume**: `uploads_data` (for file uploads)
- **Health Check**: HTTP check every 30s
- **Wait Strategy**: Waits for MySQL to be healthy

## Environment Variables

You can customize the deployment using environment variables in `docker-compose.yml`:

```yaml
environment:
  SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/pre_accounting_db...
  SPRING_DATASOURCE_USERNAME: root
  SPRING_DATASOURCE_PASSWORD: pokok123
  SPRING_JPA_HIBERNATE_DDL_AUTO: update
  SPRING_JPA_SHOW_SQL: false
  FILE_UPLOAD_DIR: /app/uploads/receipts
```

## Persistent Data

### Volumes

Two Docker volumes are created for data persistence:

1. **mysql_data**: Stores MySQL database files
2. **uploads_data**: Stores uploaded receipt files

### Backup Database

```bash
# Backup
docker exec preaccounting-mysql mysqldump -uroot -ppokok123 pre_accounting_db > backup.sql

# Restore
docker exec -i preaccounting-mysql mysql -uroot -ppokok123 pre_accounting_db < backup.sql
```

### Backup Uploaded Files

```bash
# Create backup
docker run --rm -v preaccountingg_uploads_data:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup.tar.gz /data

# Restore backup
docker run --rm -v preaccountingg_uploads_data:/data -v $(pwd):/backup alpine tar xzf /backup/uploads-backup.tar.gz -C /
```

## Production Deployment

### Security Recommendations

1. **Change Default Passwords**
   - Update MySQL root password in `docker-compose.yml`
   - Update admin user password after first login

2. **Use Environment Files**
   ```bash
   # Create .env file
   MYSQL_ROOT_PASSWORD=your_secure_password
   JWT_SECRET=your_secure_jwt_secret
   ```

3. **Enable HTTPS**
   - Use a reverse proxy (Nginx/Traefik) with SSL certificates
   - Or use Docker with SSL configuration

4. **Resource Limits**
   Add to docker-compose.yml:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '2'
         memory: 2G
       reservations:
         cpus: '1'
         memory: 1G
   ```

### Using Different Profile

To use the docker profile:

```bash
docker-compose up -d --build
```

The application automatically uses `application-docker.yml` configuration in the Docker environment.

## Troubleshooting

### Application Won't Start

1. Check logs:
   ```bash
   docker-compose logs app
   ```

2. Verify MySQL is healthy:
   ```bash
   docker-compose ps
   ```

3. Check database connection:
   ```bash
   docker exec -it preaccounting-app sh
   # Inside container:
   wget -O- http://localhost:8081/
   ```

### Port Already in Use

If port 8081 or 3306 is already in use, change it in `docker-compose.yml`:

```yaml
ports:
  - "8082:8081"  # Use port 8082 instead
```

### Database Connection Issues

1. Wait for MySQL to fully start (check health status)
2. Verify network connectivity:
   ```bash
   docker exec -it preaccounting-app ping mysql
   ```

### Clear Everything and Start Fresh

```bash
# Stop and remove containers, networks, and volumes
docker-compose down -v

# Remove images
docker rmi $(docker images 'preaccountingg*' -q)

# Start fresh
docker-compose up -d --build
```

## Development vs Production

### Development Mode

For development with hot reload, mount source code:

```yaml
volumes:
  - ./src:/app/src
  - uploads_data:/app/uploads
```

### Production Mode

The current setup is optimized for production:
- Multi-stage build for smaller images
- Non-root user for security
- Health checks enabled
- Persistent volumes for data
- Optimized JVM settings

## Monitoring

### Health Checks

Both services have health checks configured:

```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' preaccounting-app
docker inspect --format='{{.State.Health.Status}}' preaccounting-mysql
```

### Resource Usage

```bash
docker stats preaccounting-app preaccounting-mysql
```

## Support

For issues or questions:
1. Check application logs: `docker-compose logs app`
2. Check MySQL logs: `docker-compose logs mysql`
3. Verify configuration in `docker-compose.yml`
4. Review `application-docker.yml` for Spring Boot settings

---

**Quick Reference:**

```bash
# Start
docker-compose up -d --build

# Stop
docker-compose down

# Logs
docker-compose logs -f

# Restart
docker-compose restart

# Clean Everything
docker-compose down -v
```
