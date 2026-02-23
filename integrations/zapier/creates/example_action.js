/**
 * Example Action - Shell Template
 *
 * This is a template for creating Zapier actions.
 * Replace the placeholder code with your actual API logic.
 *
 * Best Practices:
 * - Use dynamic fields when data depends on user selection
 * - Always validate input before making API calls
 * - Return meaningful output fields for downstream steps
 * - Use z.dehydrateFile for file outputs
 */

const API_BASE_URL = 'https://api.parsedocu.com';

/**
 * Dynamic fields fetched based on user input
 * This is called when a field with altersDynamicFields: true changes
 */
const getDynamicFields = async (z, bundle) => {
  // Example: Fetch fields based on a selected resource
  if (!bundle.inputData.resource_id) {
    return [];
  }

  // Uncomment to fetch dynamic fields from your API:
  // const response = await z.request({
  //   url: `${API_BASE_URL}/v1/resources/${bundle.inputData.resource_id}/fields`,
  //   method: 'GET',
  //   headers: {
  //     Accept: 'application/json',
  //     'x-api-key': bundle.authData.api_key,
  //   },
  // });
  // response.throwForStatus();
  // return response.json.map(field => ({
  //   key: `data__${field.key}`,
  //   label: field.label,
  //   type: field.type || 'string',
  //   required: field.required || false,
  // }));

  return [];
};

/**
 * Main action logic
 */
const perform = async (z, bundle) => {
  // Extract input data
  const { resource_id, name, description } = bundle.inputData;

  // Build request body
  const body = {
    resource_id,
    name,
    description,
  };

  // Make API request
  const response = await z.request({
    url: `${API_BASE_URL}/v1/resources/create`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-api-key': bundle.authData.api_key,
    },
    body: body,
  });

  response.throwForStatus();
  return response.json;
};

module.exports = {
  key: 'example_action',
  noun: 'Resource',
  display: {
    label: 'Create Resource',
    description: 'Create a new resource via the API',
    hidden: false,
  },
  operation: {
    inputFields: [
      // Static field with dynamic dropdown
      {
        key: 'resource_id',
        label: 'Resource Type',
        type: 'string',
        required: true,
        dynamic: 'resourceList.id.name', // Links to a trigger for dropdown
        altersDynamicFields: true, // Triggers getDynamicFields when changed
        helpText: 'Select the resource type',
      },
      // Static text field
      {
        key: 'name',
        label: 'Name',
        type: 'string',
        required: true,
        helpText: 'Name for the new resource',
      },
      // Static textarea field
      {
        key: 'description',
        label: 'Description',
        type: 'text',
        required: false,
        helpText: 'Optional description',
      },
      // Dynamic fields - called when resource_id changes
      getDynamicFields,
    ],
    perform: perform,
    // Sample output for Zapier's testing
    sample: {
      id: 'res_abc123',
      name: 'Example Resource',
      status: 'created',
      created_at: '2024-01-20T14:30:00Z',
    },
    // Define output fields for downstream steps
    outputFields: [
      { key: 'id', label: 'Resource ID', type: 'string' },
      { key: 'name', label: 'Name', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'created_at', label: 'Created At', type: 'datetime' },
    ],
  },
};
