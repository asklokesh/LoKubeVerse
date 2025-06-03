// Test setup configuration
require('@testing-library/jest-dom');

// Mock Material Design Components
global.mdc = {
    topAppBar: {
        MDCTopAppBar: jest.fn().mockImplementation(() => ({
            listen: jest.fn(),
            destroy: jest.fn()
        }))
    },
    drawer: {
        MDCDrawer: jest.fn().mockImplementation(() => ({
            open: false,
            listen: jest.fn(),
            destroy: jest.fn()
        }))
    },
    ripple: {
        MDCRipple: jest.fn().mockImplementation(() => ({
            destroy: jest.fn()
        }))
    },
    textField: {
        MDCTextField: jest.fn().mockImplementation(() => ({
            value: '',
            destroy: jest.fn()
        }))
    },
    select: {
        MDCSelect: jest.fn().mockImplementation(() => ({
            value: '',
            listen: jest.fn(),
            destroy: jest.fn()
        }))
    },
    tabBar: {
        MDCTabBar: jest.fn().mockImplementation(() => ({
            activateTab: jest.fn(),
            listen: jest.fn(),
            destroy: jest.fn()
        }))
    },
    chips: {
        MDCChipSet: jest.fn().mockImplementation(() => ({
            destroy: jest.fn()
        }))
    }
};

// Mock WebSocket
global.WebSocket = jest.fn().mockImplementation(() => ({
    onopen: null,
    onmessage: null,
    onclose: null,
    onerror: null,
    close: jest.fn(),
    send: jest.fn()
}));

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn()
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn()
};
global.sessionStorage = sessionStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock console methods for cleaner test output
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
};

// Setup DOM helpers
global.createElement = (tag, attributes = {}, children = []) => {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    });
    return element;
};

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
}));

// Setup test timeout
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Clear DOM
    document.body.innerHTML = '';
    document.head.innerHTML = '';

    // Clear storage mocks
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();

    sessionStorageMock.getItem.mockClear();
    sessionStorageMock.setItem.mockClear();
    sessionStorageMock.removeItem.mockClear();
    sessionStorageMock.clear.mockClear();

    // Clear fetch mock
    fetch.mockClear();
});

// Setup before each test
beforeEach(() => {
    // Reset fetch mock to return successful response by default
    fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve('')
    });
});
