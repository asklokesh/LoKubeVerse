# K8s-Dash: Multi-Cloud Kubernetes Dashboard

<div align="center">

# Lokubeverse

[![GitHub stars](https://img.shields.io/github/stars/asklokesh/LoKubeVerse?style=social)](https://github.com/asklokesh/LoKubeVerse/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/asklokesh/LoKubeVerse?style=social)](https://github.com/asklokesh/LoKubeVerse/network)
[![GitHub watchers](https://img.shields.io/github/watchers/asklokesh/LoKubeVerse?style=social)](https://github.com/asklokesh/LoKubeVerse/watchers)

[![License](https://img.shields.io/github/license/asklokesh/LoKubeVerse?style=for-the-badge)](https://github.com/asklokesh/LoKubeVerse/blob/main/LICENSE)
[![Issues](https://img.shields.io/github/issues/asklokesh/LoKubeVerse?style=for-the-badge)](https://github.com/asklokesh/LoKubeVerse/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/asklokesh/LoKubeVerse?style=for-the-badge)](https://github.com/asklokesh/LoKubeVerse/pulls)
[![Last Commit](https://img.shields.io/github/last-commit/asklokesh/LoKubeVerse?style=for-the-badge)](https://github.com/asklokesh/LoKubeVerse/commits)

[![Commit Activity](https://img.shields.io/github/commit-activity/m/asklokesh/LoKubeVerse?style=flat-square)](https://github.com/asklokesh/LoKubeVerse/pulse)
[![Code Size](https://img.shields.io/github/languages/code-size/asklokesh/LoKubeVerse?style=flat-square)](https://github.com/asklokesh/LoKubeVerse)
[![Contributors](https://img.shields.io/github/contributors/asklokesh/LoKubeVerse?style=flat-square)](https://github.com/asklokesh/LoKubeVerse/graphs/contributors)

</div>

K8s-Dash is a modern, responsive dashboard for managing Kubernetes clusters across multiple cloud providers.

## Features

- **Multi-cloud management**: AWS, Azure, GCP support
- **Real-time monitoring**: Resource usage, cluster health
- **Workload management**: Deploy, scale, and manage workloads
- **Cost analysis**: Track and optimize Kubernetes spending
- **User management**: Role-based access control

## Architecture

- **Frontend**: React + Vite + TailwindCSS with iOS-inspired design
- **Backend**: FastAPI (Python)
- **Storage**: PostgreSQL database
- **Messaging**: RabbitMQ for async tasks
- **Caching**: Redis

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/k8s-dash.git
   cd k8s-dash
   ```

2. Start the application
   ```bash
   docker compose up -d
   ```

3. Access the dashboard
   - Frontend: http://localhost:3000
   - API: http://localhost:8000/docs

## Development Setup

### Environment Variables

#### Frontend (.env.local)

```
VITE_API_URL=http://localhost:8000
VITE_DEV_MODE=true
VITE_SKIP_AUTHENTICATION=true
```

#### Backend (.env)

```
DATABASE_URL=postgresql://postgres:password@db:5432/k8sdash
SECRET_KEY=development-secret-key
DEV_MODE=true
ALLOWED_ORIGINS=http://localhost:3000
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### Development Mode

In development mode, authentication can be bypassed for easier testing:

- Set `DEV_MODE=true` in backend/.env
- Set `VITE_DEV_MODE=true` and `VITE_SKIP_AUTHENTICATION=true` in frontend/.env.local

### Running Tests

#### Backend Tests

```bash
docker compose exec backend pytest
```

#### Frontend Tests

```bash
docker compose exec frontend npm test
```

## URL Configuration

### Frontend URLs

All frontend routes are client-side using React Router:

- `/` - Redirects to dashboard
- `/login` - Authentication page
- `/dashboard` - Main dashboard
- `/clusters` - Cluster management
- `/workloads` - Workload management
- `/deployments` - Deployment history and management
- `/monitoring` - Monitoring and alerts
- `/costs` - Cost analysis
- `/users` - User management

### Backend API Endpoints

Base URL: `http://localhost:8000`

Authentication:
- POST `/api/auth/login` - Regular login
- GET `/api/dev/login` - Dev mode login (when DEV_MODE=true)

Dashboard:
- GET `/api/dashboard/stats` - Dashboard statistics
- GET `/api/activity` - Recent activity

Clusters:
- GET `/api/clusters` - List all clusters
- GET `/api/clusters/{id}` - Get cluster details
- POST `/api/clusters` - Create new cluster
- PATCH `/api/clusters/{id}` - Update cluster
- DELETE `/api/clusters/{id}` - Delete cluster

Workloads:
- GET `/api/workloads` - List all workloads
- GET `/api/workloads/{id}` - Get workload details
- POST `/api/workloads` - Deploy new workload
- PATCH `/api/workloads/{id}` - Update workload
- DELETE `/api/workloads/{id}` - Delete workload

## Troubleshooting

### Blank Page on Frontend

If you encounter a blank page:

1. Check browser console for errors
2. Verify environment variables are set correctly
3. Ensure frontend container is running: `docker compose ps`
4. Check frontend logs: `docker compose logs frontend`
5. Try rebuilding the frontend: `docker compose up --build -d frontend`
6. Ensure paths in index.html are absolute (starting with `/`)
7. Clear browser cache and reload

#### Solving the Blank Page Issue

The blank page is typically caused by one of these issues:

1. **Path Configuration**:
   - Make sure your `index.html` uses absolute paths:
     ```html
     <link rel="icon" type="image/svg+xml" href="/vite.svg" />
     <script type="module" src="/src/main.jsx"></script>
     ```
   - Remove any `base: './'` configuration from `vite.config.js`

2. **Environment Variables**:
   - Verify the environment variables are being passed correctly:
     ```bash
     docker compose exec frontend env | grep VITE
     ```
   - Create a `.env.local` file in the frontend directory with the correct variables

3. **JavaScript Errors**:
   - Access the debug page to test basic functionality:
     ```
     http://localhost:3000/debug.html
     ```
   - Check browser console for specific React errors

4. **Module Resolution**:
   - Try clearing node_modules and reinstalling dependencies:
     ```bash
     docker compose exec frontend rm -rf node_modules
     docker compose exec frontend npm install
     ```
   - Rebuild the container: `docker compose up --build -d frontend`

5. **Browser Compatibility**:
   - Try a different browser to rule out browser-specific issues
   - Update your browser to the latest version

6. **Network Issues**:
   - Ensure all API requests are going to the correct URL
   - Check network tab in developer tools for failed requests

### Authentication Issues

1. Verify DEV_MODE is set correctly in both frontend and backend
2. Check backend logs for authentication errors
3. Try using the demo credentials: demo@k8sdash.com / demo123
4. Check that the backend API is accessible: http://localhost:8000/docs

### Database Connection Issues

1. Check if database container is running: `docker compose ps db`
2. Verify database credentials in backend/.env
3. Check database logs: `docker compose logs db`
4. Try restarting the database: `docker compose restart db`

## Path Configuration

When deploying to production, update the following:

1. In `frontend/index.html`, use absolute paths for assets:
   ```html
   <link rel="icon" type="image/svg+xml" href="/vite.svg" />
   <script type="module" src="/src/main.jsx"></script>
   ```

2. In `frontend/vite.config.js`, ensure proper build settings:
   ```js
   build: {
     target: 'es2019',
     sourcemap: true,
   }
   ```

3. Set correct API URL in production:
   ```
   VITE_API_URL=https://api.your-domain.com
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
