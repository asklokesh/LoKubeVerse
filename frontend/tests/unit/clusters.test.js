const { createClusters } = require('../../public/js/components/Clusters');

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Clusters Component', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="app"></div>';
    });

    test('renders clusters container', async () => {
        const clusters = createClusters();
        // Wait for render to complete
        await new Promise(resolve => setTimeout(resolve, 100));

        const clustersEl = document.querySelector('.clusters-container');
        expect(clustersEl).not.toBeNull();
        expect(clustersEl.textContent).toContain('Clusters');
    });
});
