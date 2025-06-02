# K8s-Dash: Multi-Cloud Kubernetes Management Platform

A unified dashboard for managing Kubernetes clusters across AWS (EKS), Azure (AKS), and GCP (GKE).

## Features

- 🔐 **Multi-Cloud Authentication**
  - AWS EKS integration
  - Azure AKS integration
  - GCP GKE integration
  - Service account support

- 🎯 **Cluster Management**
  - Create/delete/scale clusters
  - Namespace management
  - Workload deployment
  - Resource quotas and limits
  - RBAC configuration
  - Network policies

- 📊 **Real-time Monitoring**
  - Cluster health metrics
  - Pod/node monitoring
  - Resource utilization
  - Cost tracking
  - Alert management

- 🚀 **Deployment Features**
  - Helm chart management
  - Kubernetes manifest deployment
  - GitOps workflow
  - Blue/green deployments
  - Canary deployments
  - Rollback capabilities

## Tech Stack

- **Backend**: Python FastAPI
- **Frontend**: Next.js 14, React 18, TypeScript
- **Database**: PostgreSQL
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **UI**: Tailwind CSS, Headless UI

## Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- RabbitMQ 3.9+
- Docker & Docker Compose

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/k8s-Dash.git
cd k8s-Dash
```

2. Set up the backend:
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn app.main:app --reload
```

3. Set up the frontend:
```bash
cd frontend
npm install
npm run dev
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## API Testing

### Authentication

```bash
# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'

# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123", "name": "Test User"}'
```

### Cluster Management

```bash
# List clusters
curl -X GET http://localhost:8000/clusters \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create cluster
curl -X POST http://localhost:8000/clusters \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-cluster",
    "provider": "aws",
    "region": "us-west-2",
    "version": "1.24"
  }'
```

### Deployment Management

```bash
# List deployments
curl -X GET http://localhost:8000/deployments \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create deployment
curl -X POST http://localhost:8000/deployments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-app",
    "cluster": "test-cluster",
    "namespace": "default",
    "image": "nginx:latest",
    "replicas": 3
  }'
```

## Development

### Backend Development

```bash
# Run tests
pytest

# Run linting
flake8
black .

# Generate API documentation
python scripts/generate_docs.py
```

### Frontend Development

```bash
# Run tests
npm test

# Run linting
npm run lint

# Build for production
npm run build
```

## Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@k8s-dash.com or join our Slack channel.

## Testing Instructions

- Start backend: `uvicorn backend.main:app --reload`
- Start frontend: `cd frontend && npm run dev`
- Run backend tests: `pytest`
- Run frontend tests: `cd frontend && npm run test`
- Run all tests: `pytest && cd frontend && npm run test`

## Current Status

- Backend: Basic CRUD operations for users, clusters, and deployments
- Frontend: Basic UI for users, clusters, and deployments
- Tests: Basic smoke tests for both backend and frontend

## Known Issues

- SSO login, tenant switcher, and user invite UI not implemented
- Namespace, workload, RBAC, quotas, network policy, and cost dashboards missing in frontend
- Advanced monitoring, multi-cluster views, blue/green/canary/rollback deployment controls not present
- Role assignment and audit log viewer not implemented
- Some backend endpoints for above features may be missing

## Next Steps

1. Implement SSO login and tenant switcher in Auth UI
2. Add namespace/workload/RBAC/quotas/network policy/cost management UIs
3. Build deployment UI for Helm, GitOps, blue/green/canary/rollback
4. Add user invite, role assignment, and audit log viewer
5. Implement enterprise features: SSO config, advanced monitoring, multi-cluster views
6. Connect new UIs to backend endpoints
7. Write unit/integration tests for new features
8. Update documentation 