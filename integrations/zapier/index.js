/**
 * Zapier Integration - Main Entry Point
 *
 * This file defines the structure of your Zapier integration:
 * - Authentication method
 * - Triggers (for polling data or populating dropdowns)
 * - Creates (actions that create/modify data)
 * - Searches (actions that find existing data)
 *
 * Best Practices:
 * - Use requestTemplate for common headers
 * - Keep triggers hidden if they're only for dropdowns
 * - Export hydrators for file handling
 */

const authentication = require('./authentication');
const exampleAction = require('./creates/example_action');
const resourceList = require('./triggers/resource_list');
const hydrators = require('./hydrators');

module.exports = {
  // Version from package.json
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  // Authentication configuration
  authentication: authentication,

  // Hydrators for file handling (lazy loading)
  hydrators: hydrators,

  // Default headers for all requests
  requestTemplate: {
    headers: {
      'X-API-KEY': '{{bundle.authData.api_key}}',
    },
  },

  // Triggers - used for polling or populating dropdowns
  triggers: {
    [resourceList.key]: resourceList,
    // Add more triggers here:
    // [newItemTrigger.key]: newItemTrigger,
  },

  // Creates - actions that create or modify data
  creates: {
    [exampleAction.key]: exampleAction,
    // Add more actions here:
    // [updateAction.key]: updateAction,
  },

  // Searches - actions that find existing data
  searches: {
    // [findResource.key]: findResource,
  },
};
