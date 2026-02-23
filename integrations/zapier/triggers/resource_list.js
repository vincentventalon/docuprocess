/**
 * Resource List Trigger (Hidden)
 *
 * This is a hidden trigger used to populate dropdowns in actions.
 * It fetches available resources for the authenticated user.
 *
 * Best Practices:
 * - Keep hidden: true for triggers used only for dropdowns
 * - Return objects with 'id' and 'name' properties for dropdowns
 * - Handle empty results gracefully
 */

const API_BASE_URL = 'https://api.parsedocu.com';

const perform = async (z, bundle) => {
  const response = await z.request({
    url: `${API_BASE_URL}/v1/resources`,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'x-api-key': bundle.authData.api_key,
    },
  });

  response.throwForStatus();
  const results = response.json;

  // Return resources with id and name for dropdown
  // Adjust the mapping based on your API response structure
  return (results.resources || results || []).map((resource) => ({
    id: resource.id,
    name: resource.name,
  }));
};

module.exports = {
  key: 'resourceList',
  noun: 'Resource',
  display: {
    label: 'Resource List',
    description: 'Fetches available resources for dropdown selection',
    hidden: true, // Hidden from users - used only for dynamic dropdowns
  },
  operation: {
    perform,
    sample: {
      id: 'res_abc123',
      name: 'Example Resource',
    },
    outputFields: [
      { key: 'id', label: 'Resource ID', type: 'string' },
      { key: 'name', label: 'Resource Name', type: 'string' },
    ],
  },
};
