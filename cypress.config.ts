import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: true,
    videoCompression: 32,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // Plugin code here
    }
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite'
    }
  },
  env: {
    apiUrl: 'http://localhost:4000',
    demoEmail: 'demo@pathway.local',
    demoPassword: 'demo_password'
  }
});
