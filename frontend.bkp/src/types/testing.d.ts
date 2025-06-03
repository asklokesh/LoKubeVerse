// This file allows TypeScript to recognize the testing-library/jest-dom matchers
import '@testing-library/jest-dom';

interface CustomMatchers<R = unknown> {
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

declare global {
    namespace jest {
        interface Expect extends CustomMatchers { }
        interface Matchers<R> extends CustomMatchers<R> { }
        interface InverseAsymmetricMatchers extends CustomMatchers { }
    }
}

// Add support for mocked modules like axios
declare module 'axios' {
    export interface AxiosStatic {
        get: jest.Mock;
        post: jest.Mock;
        put: jest.Mock;
        delete: jest.Mock;
        interceptors: {
            request: {
                use: jest.Mock;
                eject: jest.Mock;
            };
            response: {
                use: jest.Mock;
                eject: jest.Mock;
            };
        };
    }
}
