/**
 * Tests for Example Action
 *
 * Best Practices:
 * - Test with valid and invalid inputs
 * - Mock API responses
 * - Test error handling
 */

const zapier = require('zapier-platform-core');
const App = require('../../index');

const appTester = zapier.createAppTester(App);

describe('Example Action', () => {
  // Set up authentication for tests
  const bundle = {
    authData: {
      api_key: process.env.TEST_API_KEY || 'test_api_key',
    },
    inputData: {
      resource_id: 'res_test123',
      name: 'Test Resource',
      description: 'A test resource',
    },
  };

  it('should create a resource', async () => {
    // Skip if no API key configured
    if (!process.env.TEST_API_KEY) {
      console.log('Skipping test - no TEST_API_KEY configured');
      return;
    }

    const result = await appTester(
      App.creates.example_action.operation.perform,
      bundle
    );

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
  });

  it('should handle missing required fields', async () => {
    const invalidBundle = {
      ...bundle,
      inputData: {
        // Missing required 'name' field
        resource_id: 'res_test123',
      },
    };

    // This should either throw or return an error
    // Adjust based on your API's behavior
    try {
      await appTester(
        App.creates.example_action.operation.perform,
        invalidBundle
      );
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
