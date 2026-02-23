const zapier = require('zapier-platform-core');
const App = require('../index');

const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

// Get API key from environment (consistent with backend E2E tests)
const API_KEY = process.env.E2E_API_KEY || process.env.API_KEY;

describe('authentication', () => {
  beforeAll(() => {
    if (!API_KEY) {
      console.warn(
        'WARNING: E2E_API_KEY not set. Authentication tests will fail.'
      );
    }
  });

  it('should authenticate with valid API key', async () => {
    if (!API_KEY) {
      console.log('Skipping: E2E_API_KEY not set');
      return;
    }

    const bundle = {
      authData: {
        api_key: API_KEY,
      },
    };

    const response = await appTester(App.authentication.test, bundle);

    expect(response).toBeDefined();
    expect(response.credits).toBeDefined();
    expect(typeof response.credits).toBe('number');
  });

  it('should return account info with email', async () => {
    if (!API_KEY) {
      console.log('Skipping: E2E_API_KEY not set');
      return;
    }

    const bundle = {
      authData: {
        api_key: API_KEY,
      },
    };

    const response = await appTester(App.authentication.test, bundle);

    expect(response).toBeDefined();
    // Email may or may not be present depending on account setup
    if (response.email) {
      expect(typeof response.email).toBe('string');
    }
  });

  it('should fail with invalid API key', async () => {
    const bundle = {
      authData: {
        api_key: 'sk_invalid_key_12345',
      },
    };

    await expect(appTester(App.authentication.test, bundle)).rejects.toThrow();
  });

  it('should fail with empty API key', async () => {
    const bundle = {
      authData: {
        api_key: '',
      },
    };

    await expect(appTester(App.authentication.test, bundle)).rejects.toThrow();
  });
});
