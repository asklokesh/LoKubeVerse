/// <reference types="cypress" />

describe('Multi-Cloud Features E2E Tests', () => {
    beforeEach(() => {
        cy.intercept('GET', '/api/clusters', { fixture: 'clusters.json' }).as('getClusters')
        cy.intercept('GET', '/api/monitoring/metrics', { fixture: 'metrics.json' }).as('getMetrics')
        cy.intercept('GET', '/api/costs', { fixture: 'costs.json' }).as('getCosts')

        cy.visit('/')
    })

    it('should display multi-cluster dashboard', () => {
        cy.get('[data-testid="nav-multi-cluster"]').click()
        cy.url().should('include', '/multi-cluster')
        cy.wait('@getClusters')

        cy.contains('Multi-Cluster Dashboard').should('be.visible')
        cy.get('[data-testid="cluster-card"]').should('have.length.greaterThan', 0)
    })

    it('should show monitoring dashboard with metrics', () => {
        cy.get('[data-testid="nav-monitoring"]').click()
        cy.url().should('include', '/monitoring')
        cy.wait('@getMetrics')

        cy.contains('Monitoring Dashboard').should('be.visible')
        cy.get('[data-testid="metrics-chart"]').should('be.visible')
        cy.get('[data-testid="resource-usage"]').should('be.visible')
    })

    it('should display cost dashboard', () => {
        cy.get('[data-testid="nav-costs"]').click()
        cy.url().should('include', '/costs')
        cy.wait('@getCosts')

        cy.contains('Cost Dashboard').should('be.visible')
        cy.get('[data-testid="cost-chart"]').should('be.visible')
        cy.get('[data-testid="cost-breakdown"]').should('be.visible')
    })

    it('should manage RBAC settings', () => {
        cy.intercept('GET', '/api/rbac', { fixture: 'rbac.json' }).as('getRBAC')
        cy.intercept('POST', '/api/rbac', { statusCode: 201 }).as('createRole')

        cy.get('[data-testid="nav-rbac"]').click()
        cy.url().should('include', '/rbac')
        cy.wait('@getRBAC')

        cy.get('[data-testid="create-role-btn"]').click()
        cy.get('#roleName').type('test-role')
        cy.get('#permissions').select(['read', 'write'])
        cy.get('button[type="submit"]').click()

        cy.wait('@createRole')
        cy.contains('Role created successfully').should('be.visible')
    })

    it('should manage network policies', () => {
        cy.intercept('GET', '/api/network-policies', { fixture: 'network-policies.json' }).as('getNetworkPolicies')
        cy.intercept('POST', '/api/network-policies', { statusCode: 201 }).as('createPolicy')

        cy.get('[data-testid="nav-network"]').click()
        cy.url().should('include', '/network-policies')
        cy.wait('@getNetworkPolicies')

        cy.get('[data-testid="create-policy-btn"]').click()
        cy.get('#policyName').type('test-policy')
        cy.get('#namespace').type('default')
        cy.get('button[type="submit"]').click()

        cy.wait('@createPolicy')
        cy.contains('Policy created successfully').should('be.visible')
    })

    it('should perform deployment controls', () => {
        cy.intercept('POST', '/api/deployments/*/bluegreen', { statusCode: 200 }).as('blueGreenDeploy')
        cy.intercept('POST', '/api/deployments/*/canary', { statusCode: 200 }).as('canaryDeploy')
        cy.intercept('POST', '/api/deployments/*/rollback', { statusCode: 200 }).as('rollback')

        cy.get('[data-testid="nav-deployments"]').click()
        cy.get('[data-testid="deployment-item"]').first().click()

        // Test Blue-Green deployment
        cy.get('[data-testid="blue-green-btn"]').click()
        cy.wait('@blueGreenDeploy')
        cy.contains('Blue-Green deployment initiated').should('be.visible')

        // Test Canary deployment
        cy.get('[data-testid="canary-btn"]').click()
        cy.wait('@canaryDeploy')
        cy.contains('Canary deployment initiated').should('be.visible')

        // Test Rollback
        cy.get('[data-testid="rollback-btn"]').click()
        cy.wait('@rollback')
        cy.contains('Rollback initiated').should('be.visible')
    })
})
