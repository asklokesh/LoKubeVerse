import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

// Just a simple test to verify the TypeScript annotations work
describe('Basic TypeScript Tests', () => {
    test('TypeScript recognizes Jest Dom matchers', () => {
        render(<div data-testid="test">Test</div>);
        expect(screen.getByTestId('test')).toBeInTheDocument();
        expect(screen.getByText('Test')).toBeVisible();
        expect(screen.getByTestId('test').textContent).toBe('Test');
    });
});
