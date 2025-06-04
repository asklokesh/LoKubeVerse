# K8s Dash Frontend

Beautiful iOS-inspired frontend for multi-cloud Kubernetes management platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 🎨 Features

- **iOS 18 Inspired Design**: Modern glass morphism effects with smooth animations
- **Full Backend Integration**: All APIs connected and ready
- **Real-time Updates**: WebSocket support for live metrics
- **TDD Approach**: Comprehensive test coverage
- **Responsive**: Works perfectly on all devices

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Check coverage
npm run test:coverage
```

## 🏗️ Architecture

```
frontend/
├── src/
│   ├── components/      # React components
│   ├── services/        # API services
│   ├── test/           # Test setup
│   └── index.css       # Tailwind styles
├── tests/              # Component tests
└── vite.config.js      # Vite configuration
```

## 🔌 API Integration

All backend endpoints are integrated:

- **Authentication**: Login/Logout with JWT
- **Clusters**: Full CRUD operations
- **Workloads**: Deploy and manage
- **Monitoring**: Real-time metrics
- **WebSocket**: Live updates

## 🎯 Key Components

### Dashboard
- Real-time stats
- Recent activity timeline
- Cost breakdown by provider

### Clusters
- Create/Edit/Delete clusters
- Filter by provider
- Live status updates

### Layout
- iOS-style navigation
- Glass morphism effects
- Responsive sidebar

## 🚦 Development

1. **Start Backend First**:
   ```bash
   cd .. && docker-compose up
   ```

2. **Run Frontend**:
   ```bash
   npm run dev
   ```

3. **Login with Demo Credentials**:
   - Email: `demo@k8sdash.com`
   - Password: `demo123`

## 🔧 Configuration

Backend API proxy is configured in `vite.config.js`:
- API calls: `http://localhost:8000/api/*`
- WebSocket: `ws://localhost:8000/ws`

## 📱 Responsive Design

- **Desktop**: Full sidebar navigation
- **Tablet**: Collapsible sidebar
- **Mobile**: Bottom navigation

## 🌈 Color Scheme

iOS-inspired colors:
- Primary: `#007AFF`
- Success: `#34C759`
- Warning: `#FF9500`
- Error: `#FF3B30`

## 🛠️ Tech Stack

- **React 18**: UI library
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Framer Motion**: Animations
- **Axios**: API calls
- **React Router**: Navigation
- **Vitest**: Testing

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🤝 Contributing

1. Follow TDD approach
2. Write tests first
3. Keep components simple
4. Use iOS design patterns

---

Built with ❤️ for speed and simplicity 