import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple test component
const SimpleComponent = () => (
    <div data-testid="simple-component">
        <h1>Test Component</h1>
        <p>This is a test</p>
    </div>
);

describe('Simple Component Test', () => {
    it('should render without crashing', () => {
        render(<SimpleComponent />);
        expect(screen.getByTestId('simple-component')).toBeInTheDocument();
    });

    it('should display heading', () => {
        render(<SimpleComponent />);
        expect(screen.getByRole('heading')).toHaveTextContent('Test Component');
    });
});
