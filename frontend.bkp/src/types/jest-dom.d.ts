// Custom TypeScript definitions for @testing-library/jest-dom
import '@testing-library/jest-dom';

// This is the most comprehensive way to declare the Jest DOM matchers
// to ensure TypeScript recognizes them correctly in test files
declare global {
    namespace jest {
        // For regular assertions
        interface Matchers<R = unknown> {
            toBeInTheDocument(): R;
            toBeVisible(): R;
            toBeRequired(): R;
            toBeDisabled(): R;
            toBeEnabled(): R;
            toBeEmptyDOMElement(): R;
            toBeInvalid(): R;
            toBeValid(): R;
            toContainElement(element: HTMLElement | null | undefined): R;
            toContainHTML(html: string): R;
            toHaveAccessibleDescription(expectedAccessibleDescription?: string | RegExp): R;
            toHaveAccessibleName(expectedAccessibleName?: string | RegExp): R;
            toHaveAttribute(attr: string, value?: any): R;
            toHaveClass(...classNames: string[]): R;
            toHaveFocus(): R;
            toHaveFormValues(expectedValues: Record<string, any>): R;
            toHaveStyle(css: Record<string, any> | string): R;
            toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): R;
            toHaveValue(value?: string | string[] | number | null): R;
            toBeChecked(): R;
            toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): R;
            toBePartiallyChecked(): R;
        }

        // For expect interface
        interface Expect extends Matchers<void> { }

        // For asymmetric matchers
        interface AsymmetricMatchers extends Matchers<void> { }
    }
}
