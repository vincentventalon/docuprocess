# Make.com Integration Template

Template for building Make.com (formerly Integromat) custom apps.

## Project Structure

```
integrations/make/
├── makecomapp.json                 # App manifest (modules, RPCs, connections)
├── README.md
├── general/
│   ├── base.iml.json               # Base configuration (API URL, headers)
│   └── common.json                 # Shared variables
├── connections/
│   └── connection1/                # API key authentication
│       ├── connection1.common.json
│       ├── connection1.communication.iml.json
│       └── connection1.params.iml.json
├── modules/
│   ├── groups.json                 # Module grouping
│   ├── create-resource/            # Example action module
│   │   ├── create-resource.communication.iml.json
│   │   ├── create-resource.mappable-params.iml.json
│   │   ├── create-resource.static-params.iml.json
│   │   ├── create-resource.interface.iml.json
│   │   ├── create-resource.samples.iml.json
│   │   └── create-resource.scope.iml.json
│   └── universalmoduleapi/         # Generic API call module
└── rpcs/
    ├── list-resources/             # Dropdown population
    └── get-resource-fields/        # Dynamic field loading
```

## Key Concepts

### Connection (`connections/connection1/`)

Defines API authentication:
- `params.iml.json` - Input fields (API key)
- `communication.iml.json` - Validation request
- `common.json` - Shared connection data

### Modules (`modules/`)

Actions that users add to scenarios:
- `communication.iml.json` - API request configuration
- `mappable-params.iml.json` - User input fields
- `static-params.iml.json` - Hidden/computed fields
- `interface.iml.json` - Output fields
- `samples.iml.json` - Sample output data
- `scope.iml.json` - OAuth scopes (if applicable)

### RPCs (`rpcs/`)

Remote Procedure Calls for dynamic data:
- **ListResources** - Populates dropdown menus
- **GetResourceFields** - Loads dynamic fields based on selection

## Dynamic Fields Pattern

Make supports loading input fields dynamically based on user selection:

```json
// In mappable-params.iml.json
{
    "name": "resource_id",
    "type": "select",
    "options": {
        "store": "rpc://ListResources",
        "nested": [
            {
                "name": "payload_type",
                "type": "select",
                "options": [
                    {
                        "label": "Dynamic Fields",
                        "value": "schema",
                        "nested": "rpc://GetResourceFields"
                    }
                ]
            }
        ]
    }
}
```

## Development

### Prerequisites

- Make.com developer account
- Make CLI (optional): `npm install -g @make/cli`

### Setup

1. Create a new app in the Make Developer Hub
2. Copy the app ID to your project
3. Upload or sync your code files

### File Syntax

Make uses IML (Integromat Markup Language) for templating:

```json
// Variable substitution
"url": "/v1/resources/{{parameters.resource_id}}"

// Conditionals
"{{if(condition, trueValue, falseValue)}}"

// Iteration
"iterate": "{{body.items}}"
"output": {
    "label": "{{item.name}}"
}
```

### Testing

Use the Make Developer Hub to:
1. Create a test connection
2. Add modules to a test scenario
3. Run the scenario and inspect results

## Adding New Modules

### 1. Create Module Directory

```bash
mkdir modules/my-action
```

### 2. Create Required Files

**communication.iml.json** - API request:
```json
{
    "url": "/v1/my-endpoint",
    "method": "POST",
    "body": {
        "name": "{{parameters.name}}"
    },
    "response": {
        "output": "{{body}}"
    }
}
```

**mappable-params.iml.json** - Input fields:
```json
[
    {
        "name": "name",
        "type": "text",
        "label": "Name",
        "required": true
    }
]
```

**interface.iml.json** - Output fields:
```json
[
    {
        "name": "id",
        "type": "text",
        "label": "ID"
    }
]
```

### 3. Register in makecomapp.json

```json
{
    "components": {
        "module": {
            "MyAction": {
                "label": "My Action",
                "description": "Does something",
                "moduleType": "action",
                "actionCrud": "create",
                "connection": "connection1",
                "codeFiles": {
                    "communication": "modules/my-action/my-action.communication.iml.json",
                    "mappableParams": "modules/my-action/my-action.mappable-params.iml.json",
                    "interface": "modules/my-action/my-action.interface.iml.json"
                }
            }
        }
    }
}
```

### 4. Add to groups.json

```json
[
    {
        "label": "My Group",
        "modules": ["MyAction"]
    }
]
```

## Resources

- [Make Developer Documentation](https://docs.make.com/custom-apps/)
- [IML Reference](https://docs.make.com/iml/)
- [Make Developer Hub](https://www.make.com/en/integrations/developer-hub)

## License

[MIT](LICENSE)
