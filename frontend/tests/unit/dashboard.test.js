const { createDashboard } = require('../../public/js/components/Dashboard');

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Dashboard Component', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="app"></div>';
    });

    test('should render dashboard container into #app', async () => {
        const dashboard = createDashboard();
        // Wait for render to complete
        await new Promise(resolve => setTimeout(resolve, 100));

        const dashboardEl = document.querySelector('.dashboard-container');
        expect(dashboardEl).not.toBeNull();
        expect(dashboardEl.textContent).toContain('Kubernetes Dashboard');
    });
});
