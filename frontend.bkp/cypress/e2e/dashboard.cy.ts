/// <reference types="cypress" />

describe('K8s Dashboard E2E Tests', () => {
    beforeEach(() => {
        // Mock API responses
        cy.intercept('GET', '/api/auth/me', { fixture: 'user.json' }).as('getUser')
        cy.intercept('GET', '/api/clusters', { fixture: 'clusters.json' }).as('getClusters')
        cy.intercept('GET', '/api/deployments', { fixture: 'deployments.json' }).as('getDeployments')

        cy.visit('/')
    })

    it('should load the dashboard homepage', () => {
        cy.contains('Welcome to K8s-Dash').should('be.visible')
        cy.get('[data-testid="dashboard-nav"]').should('be.visible')
    })

    it('should navigate to clusters page', () => {
        cy.get('[data-testid="nav-clusters"]').click()
        cy.url().should('include', '/clusters')
        cy.wait('@getClusters')
        cy.contains('Clusters').should('be.visible')
    })

    it('should navigate to deployments page', () => {
        cy.get('[data-testid="nav-deployments"]').click()
        cy.url().should('include', '/deployments')
        cy.wait('@getDeployments')
        cy.contains('Deployments').should('be.visible')
    })

    it('should create a new deployment', () => {
        cy.intercept('POST', '/api/deployments', {
            statusCode: 201,
            body: { id: '1', name: 'test-deployment', status: 'creating' }
        }).as('createDeployment')

        cy.get('[data-testid="nav-deployments"]').click()
        cy.get('[data-testid="create-deployment-btn"]').click()

        cy.get('#name').type('test-deployment')
        cy.get('#namespace').type('default')
        cy.get('#image').type('nginx:latest')
        cy.get('#cluster').select('cluster-1')

        cy.get('button[type="submit"]').click()
        cy.wait('@createDeployment')

        cy.contains('test-deployment').should('be.visible')
    })

    it('should handle authentication flow', () => {
        cy.intercept('POST', '/api/auth/login', {
            statusCode: 200,
            body: { access_token: 'fake-token', user: { id: 1, email: 'test@example.com' } }
        }).as('login')

        cy.get('[data-testid="login-btn"]').click()

        cy.get('#email').type('test@example.com')
        cy.get('#password').type('password123')
        cy.get('button[type="submit"]').click()

        cy.wait('@login')
        cy.contains('Dashboard').should('be.visible')
    })

    it('should switch between tenants', () => {
        cy.intercept('GET', '/api/tenants', { fixture: 'tenants.json' }).as('getTenants')
        cy.intercept('POST', '/api/tenants/switch', { statusCode: 200 }).as('switchTenant')

        cy.get('[data-testid="tenant-switcher"]').click()
        cy.wait('@getTenants')

        cy.get('[data-testid="tenant-option"]').first().click()
        cy.wait('@switchTenant')

        cy.contains('Tenant switched successfully').should('be.visible')
    })
})
