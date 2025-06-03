/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';

describe('Jest DOM Setup', () => {
    test('Jest DOM matchers are working correctly', () => {
        document.body.innerHTML = '<div data-testid="test-div">Hello World</div>';

        const element = document.querySelector('[data-testid="test-div"]');

        // If these assertions work, our Jest DOM setup is correct
        expect(element).toBeInTheDocument();
        expect(element).toHaveTextContent('Hello World');
    });
});
