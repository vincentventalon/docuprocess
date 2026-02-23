#!/usr/bin/env python3
"""
Generate OpenAPI schema and Postman collection from FastAPI app.

Usage:
    cd backend && uv run python ../scripts/generate.py

This script extracts the OpenAPI schema from the FastAPI app and:
1. Writes the OpenAPI schema to generated/openapi.json
2. Converts it to Postman Collection v2.1 format at generated/postman/

The generated Postman collection includes:
- All V1 API endpoints
- Request/response examples from the code
- Postman variables ({{base_url}}, {{api_key}}, {{template_id}})
- Organized folders by API tag
"""

import json
import re
import sys
from pathlib import Path
from typing import Any

# Project root and backend directory
project_root = Path(__file__).parent.parent
backend_dir = project_root / "backend"
generated_dir = project_root / "generated"

# Add the backend directory to the path so we can import the app
sys.path.insert(0, str(backend_dir))

# Import FastAPI app
from app.main import app  # noqa: E402


def get_openapi_schema() -> dict:
    """Extract OpenAPI schema from FastAPI app."""
    schema = app.openapi()

    # Add/update security schemes for SDK generation compatibility
    # Use ApiKeyAuth (header-based) which works better with OpenAPI Generator
    if "components" not in schema:
        schema["components"] = {}

    schema["components"]["securitySchemes"] = {
        "ApiKeyAuth": {
            "type": "apiKey",
            "in": "header",
            "name": "x-api-key",
            "description": "API key for authentication. Get yours at https://example.com/dashboard/api-keys",
        }
    }

    # Apply security globally to all endpoints
    schema["security"] = [{"ApiKeyAuth": []}]

    # Update individual endpoint security to use ApiKeyAuth
    for path, path_item in schema.get("paths", {}).items():
        for method, operation in path_item.items():
            if method in ["get", "post", "put", "patch", "delete"]:
                if "security" in operation:
                    operation["security"] = [{"ApiKeyAuth": []}]

    return schema


def sanitize_description(text: str | None) -> str:
    """Clean up description text for Postman."""
    if not text:
        return ""
    # Remove leading/trailing whitespace from each line
    lines = [line.strip() for line in text.strip().split("\n")]
    return "\n".join(lines)


def openapi_to_postman_url(path: str, base_url: str = "{{base_url}}") -> dict:
    """Convert OpenAPI path to Postman URL format."""
    # Replace {param} with {{param}} for Postman variables
    postman_path = re.sub(r"\{(\w+)\}", r"{{\1}}", path)

    # Split path into segments
    path_segments = [seg for seg in postman_path.split("/") if seg]

    return {
        "raw": f"{base_url}{postman_path}",
        "host": [base_url],
        "path": path_segments,
    }


def extract_request_body_example(request_body: dict | None, schemas: dict) -> dict | None:
    """Extract request body example from OpenAPI request body."""
    if not request_body:
        return None

    content = request_body.get("content", {})
    json_content = content.get("application/json", {})

    schema = json_content.get("schema", {})

    # Check for direct example
    if "example" in json_content:
        return json_content["example"]

    # Check for examples (multiple)
    if "examples" in json_content:
        first_example = next(iter(json_content["examples"].values()), {})
        return first_example.get("value")

    # Check schema reference
    if "$ref" in schema:
        ref_name = schema["$ref"].split("/")[-1]
        ref_schema = schemas.get(ref_name, {})

        # Check for examples in the schema
        if "examples" in ref_schema:
            return ref_schema["examples"][0] if ref_schema["examples"] else None

        # Build example from properties
        return build_example_from_schema(ref_schema, schemas)

    return None


def build_example_from_schema(schema: dict, schemas: dict) -> dict | None:
    """Build an example object from a schema definition."""
    if not schema or "properties" not in schema:
        return None

    example = {}
    properties = schema.get("properties", {})

    for prop_name, prop_schema in properties.items():
        # Check for example in property
        if "examples" in prop_schema:
            example[prop_name] = prop_schema["examples"][0]
        elif "example" in prop_schema:
            example[prop_name] = prop_schema["example"]
        elif "default" in prop_schema:
            example[prop_name] = prop_schema["default"]
        elif "$ref" in prop_schema:
            # Nested schema
            ref_name = prop_schema["$ref"].split("/")[-1]
            ref_schema = schemas.get(ref_name, {})
            nested_example = build_example_from_schema(ref_schema, schemas)
            if nested_example:
                example[prop_name] = nested_example
        elif prop_schema.get("type") == "string":
            example[prop_name] = prop_schema.get("examples", ["example"])[0] if "examples" in prop_schema else "string"
        elif prop_schema.get("type") == "integer":
            example[prop_name] = 0
        elif prop_schema.get("type") == "number":
            example[prop_name] = 0.0
        elif prop_schema.get("type") == "boolean":
            example[prop_name] = False
        elif prop_schema.get("type") == "object":
            example[prop_name] = {}
        elif prop_schema.get("type") == "array":
            example[prop_name] = []

    return example if example else None


def extract_query_params(parameters: list | None) -> list:
    """Extract query parameters from OpenAPI parameters."""
    if not parameters:
        return []

    query_params = []
    for param in parameters:
        if param.get("in") == "query":
            query_params.append({
                "key": param["name"],
                "value": str(param.get("schema", {}).get("default", "")),
                "description": param.get("description", ""),
            })

    return query_params


def extract_response_examples(responses: dict, schemas: dict) -> list:
    """Extract response examples from OpenAPI responses."""
    postman_responses = []

    for status_code, response_data in responses.items():
        if status_code == "422":  # Skip validation error responses
            continue

        content = response_data.get("content", {})
        json_content = content.get("application/json", {})

        # Get example from response
        example_body = None

        if "example" in json_content:
            example_body = json_content["example"]
        elif "examples" in json_content:
            # Handle multiple examples
            for example_name, example_data in json_content["examples"].items():
                example_value = example_data.get("value")
                if example_value:
                    response = {
                        "name": example_data.get("summary", f"Response {status_code}"),
                        "status": get_status_text(status_code),
                        "code": int(status_code),
                        "_postman_previewlanguage": "json",
                        "header": [{"key": "Content-Type", "value": "application/json"}],
                        "body": json.dumps(example_value, indent=2),
                    }
                    postman_responses.append(response)
            continue
        elif "schema" in json_content:
            schema = json_content["schema"]
            if "$ref" in schema:
                ref_name = schema["$ref"].split("/")[-1]
                ref_schema = schemas.get(ref_name, {})
                if "examples" in ref_schema:
                    example_body = ref_schema["examples"][0]
                else:
                    example_body = build_example_from_schema(ref_schema, schemas)

        if example_body:
            response = {
                "name": response_data.get("description", f"Response {status_code}"),
                "status": get_status_text(status_code),
                "code": int(status_code),
                "_postman_previewlanguage": "json",
                "header": [{"key": "Content-Type", "value": "application/json"}],
                "body": json.dumps(example_body, indent=2),
            }
            postman_responses.append(response)

    return postman_responses


def get_status_text(status_code: str) -> str:
    """Get HTTP status text for a status code."""
    status_texts = {
        "200": "OK",
        "201": "Created",
        "204": "No Content",
        "400": "Bad Request",
        "401": "Unauthorized",
        "402": "Payment Required",
        "403": "Forbidden",
        "404": "Not Found",
        "500": "Internal Server Error",
    }
    return status_texts.get(str(status_code), "Unknown")


def convert_openapi_to_postman(openapi_schema: dict) -> dict:
    """Convert OpenAPI schema to Postman Collection v2.1 format."""

    schemas = openapi_schema.get("components", {}).get("schemas", {})
    paths = openapi_schema.get("paths", {})

    # Map tags to folders
    tag_folders: dict[str, list] = {}
    tag_descriptions: dict[str, str] = {}

    # Extract tag descriptions
    for tag in openapi_schema.get("tags", []):
        tag_descriptions[tag["name"]] = tag.get("description", "")

    # Process each path and method
    for path, path_data in paths.items():
        # Skip non-v1 paths (UI endpoints, health checks, etc.)
        if not path.startswith("/v1/"):
            continue

        for method, operation in path_data.items():
            if method not in ["get", "post", "put", "patch", "delete"]:
                continue

            tags = operation.get("tags", ["Other"])
            tag = tags[0] if tags else "Other"

            # Create folder if not exists
            if tag not in tag_folders:
                tag_folders[tag] = []

            # Build Postman request
            request_url = openapi_to_postman_url(path)

            # Add query parameters
            query_params = extract_query_params(operation.get("parameters"))
            if query_params:
                request_url["query"] = query_params
                # Update raw URL with query string
                query_string = "&".join(f"{p['key']}={p['value']}" for p in query_params if p["value"])
                if query_string:
                    request_url["raw"] = f"{request_url['raw']}?{query_string}"

            # Build request body
            request_body = None
            if "requestBody" in operation:
                example = extract_request_body_example(operation["requestBody"], schemas)
                if example:
                    # Replace template_id with variable if present
                    if isinstance(example, dict) and "template_id" in example:
                        example["template_id"] = "{{template_id}}"

                    request_body = {
                        "mode": "raw",
                        "raw": json.dumps(example, indent=2),
                        "options": {"raw": {"language": "json"}},
                    }

            # Build Postman item
            item: dict[str, Any] = {
                "name": operation.get("summary", path),
                "request": {
                    "method": method.upper(),
                    "header": [],
                    "url": request_url,
                    "description": sanitize_description(operation.get("description")),
                },
            }

            if request_body:
                item["request"]["body"] = request_body

            # Add response examples
            responses = extract_response_examples(operation.get("responses", {}), schemas)
            if responses:
                item["response"] = responses

            tag_folders[tag].append(item)

    # Build final collection
    # Custom folder names and descriptions
    folder_config = {
        "V1 PDF API": {
            "name": "PDF Generation",
            "description": "Generate PDFs from your templates.",
        },
        "V1 Templates API": {
            "name": "Templates",
            "description": "List and inspect your templates.",
        },
        "V1 Account API": {
            "name": "Account",
            "description": "Manage your account and view usage.",
        },
        "V1 Integrations API": {
            "name": "S3 Integration",
            "description": "Configure S3-compatible storage to have generated PDFs uploaded directly to your bucket.",
        },
    }

    items = []
    for tag, requests in tag_folders.items():
        config = folder_config.get(tag, {"name": tag, "description": ""})
        folder = {
            "name": config["name"],
            "description": config["description"],
            "item": requests,
        }
        items.append(folder)

    collection = {
        "info": {
            "name": "YourApp API",
            "summary": "Generate PDFs from HTML templates via API. Design once, generate thousands.",
            "description": (
                "# YourApp API\n\n"
                "Official API collection for YourApp - Generate PDFs from HTML templates via API. "
                "Design your template once using our visual editor, then generate thousands of PDFs programmatically.\n\n"
                "## Features\n\n"
                "- **Template-based PDF generation** - Create templates with dynamic variables, generate PDFs with your data\n"
                "- **Multiple export options** - Get a signed URL (default) or raw binary PDF\n"
                "- **S3 integration** - Upload generated PDFs directly to your own S3-compatible storage\n"
                "- **No-code friendly** - Works seamlessly with Zapier, Make, n8n and other automation tools\n\n"
                "## Authentication\n\n"
                "All API endpoints require authentication via an API key passed in the `x-api-key` header. "
                "You can find your API key in the [YourApp Dashboard](https://example.com/dashboard/api-keys).\n\n"
                "```\nx-api-key: YOUR_API_KEY\n```\n\n"
                "## Base URL\n\n"
                "All API requests should be made to:\n\n"
                "```\nhttps://api.example.com\n```\n\n"
                "## Credits\n\n"
                "- PDF generation costs **1 credit** per successful request\n"
                "- All other endpoints (templates, account, integrations) are **free** to use\n"
                "- Check your balance anytime with `GET /v1/account`\n\n"
                "## Quick Start\n\n"
                "1. Create a template at [example.com](https://example.com)\n"
                "2. Copy your template ID from the dashboard\n"
                "3. Call `POST /v1/pdf/create` with your template ID and data\n"
                "4. Receive a signed URL to download your PDF\n\n"
                "## Support\n\n"
                "- Documentation: [example.com/docs](https://example.com/docs)\n"
                "- Swagger UI: [api.example.com/docs](https://api.example.com/docs)\n"
            ),
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        },
        "auth": {
            "type": "apikey",
            "apikey": [
                {"key": "key", "value": "x-api-key", "type": "string"},
                {"key": "value", "value": "{{api_key}}", "type": "string"},
                {"key": "in", "value": "header", "type": "string"},
            ],
        },
        "variable": [
            {"key": "base_url", "value": "https://api.example.com"},
            {"key": "api_key", "value": "YOUR_API_KEY"},
            {"key": "template_id", "value": "YOUR_TEMPLATE_ID"},
        ],
        "item": items,
    }

    return collection


def main():
    """Main entry point."""
    print("Extracting OpenAPI schema from FastAPI app...")
    openapi_schema = get_openapi_schema()

    # Ensure generated directories exist
    generated_dir.mkdir(parents=True, exist_ok=True)
    (generated_dir / "postman").mkdir(parents=True, exist_ok=True)

    # Write OpenAPI schema
    openapi_path = generated_dir / "openapi.json"
    with open(openapi_path, "w", encoding="utf-8") as f:
        json.dump(openapi_schema, f, indent=2, ensure_ascii=False)
    print(f"OpenAPI schema written to: {openapi_path}")

    # Convert to Postman collection
    print("Converting to Postman Collection v2.1 format...")
    postman_collection = convert_openapi_to_postman(openapi_schema)

    # Write Postman collection
    postman_path = generated_dir / "postman" / "YourApp_API.postman_collection.json"

    with open(postman_path, "w", encoding="utf-8") as f:
        json.dump(postman_collection, f, indent="\t", ensure_ascii=False)

    print(f"Postman collection written to: {postman_path}")

    # Print summary
    total_requests = sum(len(folder["item"]) for folder in postman_collection["item"])
    print(f"\nCollection summary:")
    print(f"  - Folders: {len(postman_collection['item'])}")
    print(f"  - Total requests: {total_requests}")
    for folder in postman_collection["item"]:
        print(f"    - {folder['name']}: {len(folder['item'])} requests")


if __name__ == "__main__":
    main()
