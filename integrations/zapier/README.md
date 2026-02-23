# Zapier Integration Template

A template for building Zapier CLI integrations.

## Project Structure

```
integrations/zapier/
├── index.js                    # Main entry - registers auth, triggers & actions
├── authentication.js           # API key authentication
├── hydrators.js                # File handling utilities
├── triggers/
│   └── resource_list.js        # Hidden trigger for dropdown
├── creates/
│   └── example_action.js       # Example action with dynamic fields
├── test/
│   ├── authentication.test.js
│   ├── triggers/
│   │   └── resource_list.test.js
│   └── creates/
│       └── example_action.test.js
├── package.json
└── .zapierapprc                # Links to your Zapier app ID
```

## Key Concepts

### Authentication (`authentication.js`)

Uses **Custom Authentication** with an API key:
- User enters their API key
- The `test` function validates the key via API call
- Once authenticated, `bundle.authData.api_key` is available

### Actions (`creates/`)

Actions perform operations like creating resources:
- **Static fields**: Always shown (e.g., name, description)
- **Dynamic fields**: Fetched from API based on user selection
- **Hydrators**: Handle file downloads lazily

### Triggers (`triggers/`)

Triggers can be:
- **Visible**: Poll for new data (e.g., "New Order")
- **Hidden**: Populate dropdowns in actions (e.g., resource list)

## Dynamic Fields Pattern

```javascript
// 1. Dropdown field that triggers reload
{
  key: 'resource_id',
  type: 'string',
  dynamic: 'resourceList.id.name',  // Links to hidden trigger
  altersDynamicFields: true,        // Reloads fields when changed
}

// 2. Function that fetches fields based on selection
const getDynamicFields = async (z, bundle) => {
  if (!bundle.inputData.resource_id) return [];

  const response = await z.request({
    url: `${API_BASE_URL}/v1/resources/${bundle.inputData.resource_id}/fields`,
  });

  return response.json.map(field => ({
    key: `data__${field.key}`,  // Prefix for extraction
    label: field.label,
    type: field.type,
  }));
};

// 3. Extract prefixed fields in perform
const perform = async (z, bundle) => {
  const data = {};
  for (const [key, value] of Object.entries(bundle.inputData)) {
    if (key.startsWith('data__')) {
      data[key.replace('data__', '')] = value;
    }
  }
  // ...
};
```

## Development

### Prerequisites

- Node.js v22+
- Zapier CLI: `npm install -g zapier-platform-cli`
- Login: `zapier login`

### Setup

```bash
cd integrations/zapier
npm install
```

### Environment Variables

Create `.env` for local testing:

```env
TEST_API_KEY=your_api_key_here
```

### Run Tests

```bash
npm test
```

### Validate

```bash
zapier validate
```

### Deploy

```bash
zapier push
```

## Adding New Actions

### 1. Create the Action

```javascript
// creates/my_action.js
const perform = async (z, bundle) => {
  const response = await z.request({
    url: 'https://api.example.com/v1/endpoint',
    method: 'POST',
    body: bundle.inputData,
  });
  return response.json;
};

module.exports = {
  key: 'my_action',
  noun: 'Resource',
  display: {
    label: 'Create Resource',
    description: 'Creates a new resource',
  },
  operation: {
    perform,
    inputFields: [
      { key: 'name', label: 'Name', type: 'string', required: true },
    ],
    sample: { id: '123', name: 'Example' },
    outputFields: [
      { key: 'id', label: 'ID', type: 'string' },
    ],
  },
};
```

### 2. Register in index.js

```javascript
const myAction = require('./creates/my_action');

module.exports = {
  creates: {
    [myAction.key]: myAction,
  },
};
```

### 3. Add Tests

```javascript
// test/creates/my_action.test.js
it('should create resource', async () => {
  const result = await appTester(
    App.creates.my_action.operation.perform,
    { authData: { api_key: '...' }, inputData: { name: 'Test' } }
  );
  expect(result.id).toBeDefined();
});
```

## Resources

- [Zapier CLI Docs](https://docs.zapier.com/platform/build-cli/overview)
- [Zapier Platform Core](https://github.com/zapier/zapier-platform)
