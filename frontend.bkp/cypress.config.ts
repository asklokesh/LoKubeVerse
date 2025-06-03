import { defineConfig } from 'cypress'

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:3000',
        viewportWidth: 1280,
        viewportHeight: 720,
        video: false,
        screenshotOnRunFailure: true,
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
        specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    },
    component: {
        devServer: {
            framework: 'next',
            bundler: 'webpack',
        },
        specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    },
})
