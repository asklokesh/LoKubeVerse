# K8s-Dash Frontend Documentation

This document provides an overview of the K8s-Dash frontend implementation, focusing on the test-driven approach for local development.

## Architecture Overview

The K8s-Dash frontend is built with Next.js and provides a dashboard for managing Kubernetes clusters, deployments, and users. The application follows these key principles:

1. **Error Resilience**: The frontend is designed to handle API failures gracefully.
2. **Mock Data**: A comprehensive mock data system allows local development without a working backend.
3. **Component-Based Design**: UI is split into reusable components organized by feature.
4. **Test-Driven Development**: All components have corresponding tests.

## Key Components

### Error Handling

- `useErrorHandler`: A custom hook that provides consistent error message formatting.
- `ErrorBoundary`: React error boundary component to catch and display UI errors.
- `ErrorFallback`: Component for displaying user-friendly error messages.
- `LoadingState`: Component for consistent loading indicators.

### Mock Data

- `MockDataProvider`: Context provider that intercepts API requests and returns mock data.
- Includes mock data for clusters, deployments, namespaces, users, and tenants.

### Page Structure

- `PageWrapper`: A wrapper component that provides error boundaries and mock data to all pages.
- Each page follows a consistent pattern with loading states, error handling, and data display.

## Testing Approach

1. **Unit Tests**: Individual components are tested in isolation.
2. **Integration Tests**: Components are tested together to ensure they work as expected.
3. **Mock Data Tests**: Tests verify that mock data is correctly intercepted and used.

## Local Development

To run the frontend locally:

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Run tests:
```bash
npm test
```

## Folder Structure

```
/frontend
  /app             # Next.js app router
    /clusters      # Cluster management pages
    /deployments   # Deployment management pages
    /users         # User management pages
  /src
    /components    # UI components
      /auth        # Authentication components
      /common      # Shared components
      /tenant      # Tenant management components
      /wrappers    # HOC components
    /hooks         # Custom React hooks
    /providers     # Context providers
  /__tests__       # Test files
    /components    # Component tests
    /hooks         # Hook tests
    /integration   # Integration tests
    /mocks         # Mock providers/data tests
```

## Future Improvements

1. Add more endpoints to the mock data provider.
2. Implement the remaining UI components for cluster/deployment management.
3. Add form validation for user inputs.
4. Improve error recovery mechanisms.
5. Add end-to-end tests with Cypress.
