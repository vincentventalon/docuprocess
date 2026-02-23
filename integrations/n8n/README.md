# n8n Community Node Template

Template for building n8n community nodes.

[n8n](https://n8n.io/) is a workflow automation platform.

## Project Structure

```
integrations/n8n/
├── credentials/
│   └── YourAppApi.credentials.ts   # API authentication
├── nodes/
│   └── YourApp/
│       ├── YourApp.node.ts         # Main node logic
│       ├── GenericFunctions.ts     # API helper functions
│       └── yourapp.svg             # Node icon
├── index.ts                        # Exports
├── package.json
├── tsconfig.json
└── gulpfile.js                     # Build icons
```

## Key Concepts

### Credentials (`credentials/YourAppApi.credentials.ts`)

Defines how users authenticate:
- Input fields (API key, OAuth tokens, etc.)
- How credentials are applied to requests
- Test request to validate credentials

### Node (`nodes/YourApp/YourApp.node.ts`)

Main node implementation:
- `description`: Node metadata and input fields
- `methods.loadOptions`: Dynamic dropdown values
- `execute`: Main logic that runs for each item

### Generic Functions (`GenericFunctions.ts`)

Reusable API helper functions.

## Development

### Prerequisites

- Node.js >= 18.10
- pnpm >= 9.1

### Setup

```bash
cd integrations/n8n
pnpm install
```

### Build

```bash
pnpm build
```

### Local Testing

Link to your local n8n installation:

```bash
# In this directory
pnpm link --global

# In your n8n custom directory (~/.n8n/custom/)
pnpm link --global n8n-nodes-yourapp
```

Then restart n8n.

## Adding Operations

### 1. Add to Properties

```typescript
properties: [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    options: [
      // Add new operation
      {
        name: 'Delete Resource',
        value: 'deleteResource',
        description: 'Delete a resource',
        action: 'Delete a resource',
      },
    ],
  },
  // Add fields for new operation
  {
    displayName: 'Resource ID',
    name: 'resourceId',
    type: 'string',
    displayOptions: {
      show: {
        operation: ['deleteResource'],
      },
    },
  },
]
```

### 2. Add to Execute

```typescript
if (operation === 'deleteResource') {
  const resourceId = this.getNodeParameter('resourceId', i);
  await yourAppApiRequest.call(this, 'DELETE', `/v1/resources/${resourceId}`);
  returnData.push({ json: { success: true } });
}
```

## Dynamic Dropdowns

Use `loadOptions` for dynamic values:

```typescript
// In description.properties
{
  displayName: 'Resource',
  name: 'resourceId',
  type: 'options',
  typeOptions: {
    loadOptionsMethod: 'getResources',
  },
}

// In methods.loadOptions
async getResources(this: ILoadOptionsFunctions) {
  const response = await yourAppApiRequest.call(this, 'GET', '/v1/resources');
  return response.resources.map(r => ({
    name: r.name,
    value: r.id,
  }));
}
```

## Publishing

```bash
# Login to npm
npm login

# Publish
pnpm publish
```

## Resources

- [n8n Community Nodes Docs](https://docs.n8n.io/integrations/community-nodes/)
- [Creating Nodes Guide](https://docs.n8n.io/integrations/creating-nodes/)
- [n8n-nodes-starter](https://github.com/n8n-io/n8n-nodes-starter)

## License

[MIT](LICENSE)
