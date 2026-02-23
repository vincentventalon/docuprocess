/**
 * Generic API functions for n8n node
 *
 * Best Practices:
 * - Use httpRequestWithAuthentication for authenticated requests
 * - Handle errors gracefully
 * - Parse JSON values for complex types
 */

import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IDataObject,
} from 'n8n-workflow';

const API_BASE_URL = 'https://api.parsedocu.com';

/**
 * Make an authenticated API request
 *
 * @param method - HTTP method (GET, POST, etc.)
 * @param endpoint - API endpoint (e.g., '/v1/resources')
 * @param body - Request body (optional)
 * @param query - Query parameters (optional)
 */
export async function yourAppApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	query?: IDataObject,
): Promise<any> {
	const options: IHttpRequestOptions = {
		method,
		url: `${API_BASE_URL}${endpoint}`,
	};

	if (body) {
		options.body = body;
	}

	if (query) {
		options.qs = query;
	}

	// Uses the credentials defined in YourAppApi.credentials.ts
	return this.helpers.httpRequestWithAuthentication.call(this, 'yourAppApi', options);
}

/**
 * Parse field values, handling JSON for arrays/objects
 * Useful when users input JSON strings that need to be parsed
 */
export function parseFieldValue(value: unknown): unknown {
	if (value === null || value === undefined) {
		return value;
	}

	if (typeof value === 'string') {
		const trimmed = value.trim();
		// Try to parse JSON arrays and objects
		if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
			try {
				return JSON.parse(trimmed);
			} catch {
				// Not valid JSON, return as string
				return value;
			}
		}
	}

	return value;
}
