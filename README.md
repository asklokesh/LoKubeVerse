# K8s-Dash: Multi-Cloud Kubernetes Management Platform

A unified dashboard for managing Kubernetes clusters across AWS (EKS), Azure (AKS), and GCP (GKE).

## ✨ Current Status

**🎯 Phase 2 COMPLETE**: All frontend components and dashboards implemented
- ✅ SSO Login, Tenant Switcher, User Management (InviteUserForm, RoleAssignmentForm, AuditLogViewer)
- ✅ Namespace, Workload, RBAC, Quotas, Network Policies Dashboards
- ✅ Cost Tracking, Advanced Monitoring, Multi-Cluster Views
- ✅ Blue/Green, Canary, Rollback Deployment Controls

## Architecture Overview

![iOS-inspired K8s Dashboard](./docs/dashboard-preview.png)

### Current Features

#### 🔐 Authentication & Authorization
- **SSO Integration**: Google OAuth2 authentication
- **Multi-tenancy**: Organization-based tenant isolation
- **Role-based Access Control**: Admin, Developer, Viewer roles
- **User Management**: Invite users, assign roles, audit logging

#### 📊 Dashboard Components
- **Real-time Monitoring**: Live metrics with iOS-style glassmorphism UI
- **Multi-cluster Management**: Switch between EKS, AKS, GKE clusters
- **Resource Management**: Pods, Services, Deployments, ConfigMaps
- **Network Policies**: Visual policy editor with security recommendations

#### 🚀 Deployment Features
- **Blue/Green Deployments**: Zero-downtime deployment strategy
- **Canary Releases**: Gradual rollout with traffic splitting
- **Rollback Management**: One-click rollback to previous versions
- **Cost Tracking**: Real-time cost analysis across cloud providers

#### 📈 Monitoring & Observability
- **Prometheus Integration**: Metrics collection and alerting
- **Custom Dashboards**: Grafana-style monitoring views
- **Log Aggregation**: Centralized logging with search capabilities
- **Performance Analytics**: Resource utilization trends

## Project Structure

```
k8s-dash/
├── docs/                          # Documentation files
│   ├── README.md                  # Main project documentation
│   ├── PRD.md                     # Product Requirements Document
│   ├── COMPLETION_SUMMARY.md      # Development completion status
│   ├── COMPREHENSIVE_TESTING_REPORT.md
│   └── TESTING_REPORT.md
├── scripts/                       # Shell scripts
│   ├── security-test.sh           # Security testing script
│   ├── test_api.sh                # API testing script
│   ├── test_complete_functionality.sh
│   └── validate.sh                # Validation script
├── tests/                         # Test files and configurations
│   ├── load-test.yml              # Load testing configuration
│   ├── scale-test.yml             # Scale testing configuration
│   ├── test_output.log            # Test output logs
│   └── backend.log                # Backend logs
├── database/                      # Database files and migrations
│   ├── alembic/                   # Database migration files
│   ├── alembic.ini                # Alembic configuration
│   └── k8s_dash.db               # SQLite database
├── frontend/                      # Next.js frontend application
│   ├── app/                       # App router pages
│   ├── components/                # Reusable React components
│   ├── __tests__/                 # Frontend tests
│   └── package.json
├── backend/                       # FastAPI backend application
│   ├── app/                       # Application code
│   ├── requirements.txt           # Python dependencies
│   └── main.py
├── k8s-ui-zed/                   # UI design mockups
└── docker-compose.yml            # Docker services configuration
```

## Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Modern icon library
- **Chart.js**: Data visualization

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **Alembic**: Database migration tool
- **Pydantic**: Data validation using Python type hints
- **Kubernetes Python Client**: K8s cluster interaction

### Database
- **SQLite**: Development database
- **PostgreSQL**: Production database (configurable)

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Kubernetes**: Container orchestration

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Docker and Docker Compose
- kubectl configured for your clusters

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/k8s-dash.git
   cd k8s-dash
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Development Setup

1. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Database Setup**
   ```bash
   cd database
   alembic upgrade head
   ```

## Configuration

### Environment Variables

Create `.env` files in respective directories:

**Backend (.env)**
```env
DATABASE_URL=sqlite:///./database/k8s_dash.db
SECRET_KEY=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### Kubernetes Configuration

Ensure your `~/.kube/config` is properly configured for the clusters you want to manage.

## Testing

### Run Tests
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && python -m pytest

# Integration tests
./scripts/test_complete_functionality.sh

# Load testing
./scripts/security-test.sh
```

### Test Coverage
- Unit tests for all React components
- API endpoint tests
- Integration tests for K8s operations
- Security testing with OWASP ZAP
- Load testing with custom scripts

## Features in Detail

### Multi-Cloud Support
- **AWS EKS**: Native integration with AWS services
- **Azure AKS**: Azure-specific features and monitoring
- **GCP GKE**: Google Cloud integration and billing

### Security Features
- **RBAC Integration**: Kubernetes native role-based access
- **Network Policy Management**: Visual policy editor
- **Security Scanning**: Container vulnerability scanning
- **Audit Logging**: Complete audit trail of all actions

### Monitoring & Alerting
- **Real-time Metrics**: Live cluster and application metrics
- **Custom Alerts**: Configurable alerting rules
- **Performance Dashboards**: Resource utilization tracking
- **Cost Analysis**: Multi-cloud cost breakdown

## Deployment

### Production Deployment
1. **Configure environment variables for production**
2. **Set up PostgreSQL database**
3. **Configure cloud provider credentials**
4. **Deploy using Docker or Kubernetes**

### Kubernetes Deployment
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- 📧 Email: support@k8s-dash.io
- 📖 Documentation: [docs.k8s-dash.io](https://docs.k8s-dash.io)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/k8s-dash/issues)

## Roadmap

### Phase 3 (Upcoming)
- [ ] Multi-region cluster management
- [ ] Advanced cost optimization recommendations
- [ ] CI/CD pipeline integration
- [ ] Custom resource definition (CRD) support
- [ ] Advanced networking visualizations

### Phase 4 (Future)
- [ ] AI-powered cluster optimization
- [ ] Predictive scaling recommendations
- [ ] Advanced security policy templates
- [ ] Integration with service mesh (Istio/Linkerd)
