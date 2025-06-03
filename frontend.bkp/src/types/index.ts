
// Authentication Types
export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    lastLogin: string;
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

export interface Tenant {
    id: string;
    name: string;
    domain?: string;
    status: string;
}

// Cluster Types
export interface Cluster {
    id: string;
    name: string;
    provider: string;
    region: string;
    status: string;
    nodeCount: number;
    version: string;
    created_at: string;
    updated_at: string;
}

// Deployment Types
export interface Deployment {
    id: string;
    name: string;
    cluster: string;
    clusterId: string;
    namespace: string;
    image: string;
    status: string;
    replicas: number;
    created_at: string;
    updated_at: string;
}

// Namespace Types
export interface Namespace {
    id: string;
    name: string;
    cluster: string;
    clusterId: string;
    status: string;
    created_at: string;
}

// Workload Types
export interface Workload {
    id: string;
    name: string;
    namespace: string;
    namespaceId: string;
    clusterId: string;
    type: string;
    status: string;
    replicas: number;
    created_at: string;
}

// Network Policy Types
export interface NetworkPolicy {
    id: string;
    name: string;
    namespace: string;
    namespaceId: string;
    clusterId: string;
    spec: Record<string, any>;
    rules: string[];
    created_at: string;
}

// Quota Types
export interface Quota {
    id: string;
    namespace: string;
    namespaceId: string;
    clusterId: string;
    resource: string;
    limit: number;
    used: number;
    spec: Record<string, any>;
}

// RBAC Types
export interface RBACRule {
    id: string;
    role: string;
    resource: string;
    action: string;
    clusterId: string;
    rules: Record<string, any>;
}

// Monitoring Types
export interface Metric {
    id: string;
    metric: string;
    value: number;
    clusterId: string;
    timestamp: string;
}

export interface MonitoringData {
    id: string;
    metric: string;
    value: number;
    timestamp: string;
}

// Cost Types
export interface Cost {
    id: string;
    amount: number;
    currency: string;
    period: string;
    clusterId: string;
    service: string;
    timestamp: string;
}

export interface CostData {
    id: string;
    cluster: string;
    cost: number;
    period: string;
}

// Audit Types
export interface AuditLog {
    id: string;
    action: string;
    user: string;
    resource: string;
    timestamp: string;
    details: Record<string, any>;
    created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
    data: T;
    message: string;
    status: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

// Form Types
export interface CreateClusterForm {
    name: string;
    provider: string;
    region: string;
    nodeCount: number;
    nodeType: string;
}

export interface CreateDeploymentForm {
    name: string;
    clusterId: string;
    namespace: string;
    image: string;
    replicas: number;
}

// Navigation Types
export interface NavigationItem {
    name: string;
    href: string;
    icon: React.ComponentType<any>;
    current?: boolean;
}

// Status Types
export type StatusType = 'running' | 'pending' | 'failed' | 'succeeded' | 'unknown';
export type ProviderType = 'aws' | 'azure' | 'gcp';
export type RoleType = 'admin' | 'developer' | 'viewer';