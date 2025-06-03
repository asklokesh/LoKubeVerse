# Fixing TypeScript Jest DOM Issues

You're seeing the error `Property 'toBeInTheDocument' does not exist on type 'Assertion'` because TypeScript doesn't recognize the Jest DOM matchers in your test files. Here's how to fix this:

## Solution Options

### Option 1: Add JSDoc Comment to Your Test Files

Add this JSDoc comment at the top of any test file that uses Jest DOM matchers:

```tsx
/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
// Your test code...
```

### Option 2: Create a Global Type Declaration File

1. Create a file called `jest-dom.d.ts` in your `src/types` folder with:

```typescript
// src/types/jest-dom.d.ts
import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): R;
      // Add other matchers you need
    }
  }
}
```

2. Make sure this file is included in your `tsconfig.json`:

```json
{
  "include": [
    "next-env.d.ts",
    "src/types/**/*.d.ts",
    "**/*.ts",
    "**/*.tsx"
  ]
}
```

### Option 3: Use `// @ts-ignore` or `// @ts-expect-error`

As a quick fix (not recommended for production), you can add comments before the lines with errors:

```tsx
// @ts-expect-error
expect(screen.getByText('Loading...')).toBeInTheDocument();
```

## Testing Your Setup

After applying the fix, run:

```bash
npm run test:types
```

This should compile your TypeScript without errors.

## Additional Tips

1. Make sure your `jest-setup.js` imports Jest DOM:
   ```js
   import '@testing-library/jest-dom';
   ```

2. Ensure your Jest and TypeScript versions are compatible

3. If you continue to have issues, check that your test environment is properly set to 'jsdom' in your jest.config.js:
   ```js
   module.exports = {
     testEnvironment: 'jsdom',
     // other config options...
   };
   ```
