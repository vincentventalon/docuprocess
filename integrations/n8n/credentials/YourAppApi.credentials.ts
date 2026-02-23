import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class YourAppApi implements ICredentialType {
	name = 'yourAppApi';
	displayName = 'YourApp API';
	documentationUrl = 'https://www.parsedocu.com/docs';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Your API key. Get it from <a href="https://www.parsedocu.com/dashboard/api" target="_blank">your dashboard</a>.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.parsedocu.com',
			url: '/v1/account',
			method: 'GET',
		},
	};
}
