/**
 * n8n Node Template
 *
 * This is a template for building n8n community nodes.
 * Replace with your actual API logic.
 *
 * Best Practices:
 * - Use loadOptions for dynamic dropdowns
 * - Handle errors with continueOnFail
 * - Support batch processing (loop through items)
 * - Use usableAsTool: true for AI agent compatibility
 */

import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { yourAppApiRequest, parseFieldValue } from './GenericFunctions';

export class YourApp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'YourApp',
		name: 'yourApp',
		icon: 'file:yourapp.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with YourApp API',
		usableAsTool: true, // Makes node available to AI agents
		defaults: {
			name: 'YourApp',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'yourAppApi',
				required: true,
			},
		],
		properties: [
			// Operation selector
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Create Resource',
						value: 'createResource',
						description: 'Create a new resource',
						action: 'Create a new resource',
					},
					{
						name: 'Get Resource',
						value: 'getResource',
						description: 'Get a resource by ID',
						action: 'Get a resource by ID',
					},
					{
						name: 'List Resources',
						value: 'listResources',
						description: 'List all resources',
						action: 'List all resources',
					},
				],
				default: 'createResource',
			},

			// === Create Resource Fields ===
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				required: true,
				default: '',
				description: 'Name for the new resource',
				displayOptions: {
					show: {
						operation: ['createResource'],
					},
				},
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Optional description',
				displayOptions: {
					show: {
						operation: ['createResource'],
					},
				},
			},

			// === Get Resource Fields ===
			{
				displayName: 'Resource ID',
				name: 'resourceId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getResources',
				},
				required: true,
				default: '',
				description: 'Select the resource. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				displayOptions: {
					show: {
						operation: ['getResource'],
					},
				},
			},

			// === List Resources Options ===
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['listResources'],
					},
				},
				options: [
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						default: 50,
						description: 'Maximum number of resources to return',
						typeOptions: {
							minValue: 1,
							maxValue: 100,
						},
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			/**
			 * Fetch available resources for dropdown
			 */
			async getResources(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await yourAppApiRequest.call(this, 'GET', '/v1/resources');

				if (!response?.resources) {
					return [];
				}

				return response.resources.map((resource: { id: string; name: string }) => ({
					name: resource.name,
					value: resource.id,
				}));
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;

				if (operation === 'createResource') {
					const name = this.getNodeParameter('name', i) as string;
					const description = this.getNodeParameter('description', i, '') as string;

					const body: IDataObject = { name };
					if (description) {
						body.description = description;
					}

					const response = await yourAppApiRequest.call(this, 'POST', '/v1/resources', body);

					returnData.push({
						json: response,
						pairedItem: i,
					});
				}

				if (operation === 'getResource') {
					const resourceId = this.getNodeParameter('resourceId', i) as string;

					const response = await yourAppApiRequest.call(this, 'GET', `/v1/resources/${resourceId}`);

					returnData.push({
						json: response,
						pairedItem: i,
					});
				}

				if (operation === 'listResources') {
					const options = this.getNodeParameter('options', i, {}) as {
						limit?: number;
					};

					const query: IDataObject = {};
					if (options.limit) {
						query.limit = options.limit;
					}

					const response = await yourAppApiRequest.call(this, 'GET', '/v1/resources', undefined, query);

					// Return each resource as a separate item
					const resources = response.resources || [];
					for (const resource of resources) {
						returnData.push({
							json: resource,
							pairedItem: i,
						});
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : 'Unknown error',
						},
						pairedItem: i,
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
