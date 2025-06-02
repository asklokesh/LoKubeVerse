/// <reference types="cypress" />

// Custom commands for K8s Dashboard testing

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Custom command to login with mock authentication
             * @example cy.loginWithMock('admin')
             */
            loginWithMock(role?: string): Chainable<void>

            /**
             * Custom command to select cluster from dropdown
             * @example cy.selectCluster('cluster-1')
             */
            selectCluster(clusterId: string): Chainable<void>

            /**
             * Custom command to wait for dashboard to load
             * @example cy.waitForDashboard()
             */
            waitForDashboard(): Chainable<void>
        }
    }
}

// Login with mock authentication
Cypress.Commands.add('loginWithMock', (role: string = 'admin') => {
    cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
            access_token: 'mock-token',
            user: { id: 1, email: 'test@example.com', role }
        }
    }).as('mockLogin')

    cy.intercept('GET', '/api/auth/me', {
        statusCode: 200,
        body: { id: 1, email: 'test@example.com', role }
    }).as('mockMe')

    cy.visit('/login')
    cy.get('#email').type('test@example.com')
    cy.get('#password').type('password123')
    cy.get('button[type="submit"]').click()
    cy.wait('@mockLogin')
})

// Select cluster from dropdown
Cypress.Commands.add('selectCluster', (clusterId: string) => {
    cy.get('[data-testid="cluster-selector"]').click()
    cy.get(`[data-testid="cluster-option-${clusterId}"]`).click()
})

// Wait for dashboard to load
Cypress.Commands.add('waitForDashboard', () => {
    cy.get('[data-testid="dashboard-loading"]').should('not.exist')
    cy.get('[data-testid="dashboard-content"]').should('be.visible')
})
