/**
 * Setup global para tests con Vitest + React Testing Library
 * Se carga antes de cada archivo de tests.
 *
 * Para instalar las dependencias necesarias:
 *   npm install --save-dev vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
 *
 * Luego agrega esto en vite.config.ts dentro de defineConfig:
 *
 *   test: {
 *     globals: true,
 *     environment: 'jsdom',
 *     setupFiles: ['./src/test/setup.ts'],
 *     coverage: {
 *       provider: 'v8',
 *       reporter: ['text', 'html'],
 *     },
 *   }
 */
import '@testing-library/jest-dom';
