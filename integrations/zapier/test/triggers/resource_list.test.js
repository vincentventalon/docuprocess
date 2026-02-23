/**
 * Tests for Resource List Trigger
 */

const zapier = require('zapier-platform-core');
const App = require('../../index');

const appTester = zapier.createAppTester(App);

describe('Resource List Trigger', () => {
  const bundle = {
    authData: {
      api_key: process.env.TEST_API_KEY || 'test_api_key',
    },
  };

  it('should fetch resources for dropdown', async () => {
    if (!process.env.TEST_API_KEY) {
      console.log('Skipping test - no TEST_API_KEY configured');
      return;
    }

    const results = await appTester(
      App.triggers.resourceList.operation.perform,
      bundle
    );

    expect(Array.isArray(results)).toBe(true);
    if (results.length > 0) {
      expect(results[0]).toHaveProperty('id');
      expect(results[0]).toHaveProperty('name');
    }
  });
});
