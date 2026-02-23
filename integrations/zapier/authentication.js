const test = async (z, bundle) => {
  const options = {
    url: 'https://api.example.com/v1/account',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': bundle.authData.api_key,
    },
    params: {},
  };

  return z.request(options).then((response) => {
    const results = response.json;
    return results;
  });
};

module.exports = {
  type: 'custom',
  test: test,
  connectionLabel: '{{email}}',
  fields: [
    {
      helpText:
        'You can get your Api key https://example.com/dashboard/api once connected',
      computed: false,
      key: 'api_key',
      required: true,
      label: 'API Key',
      type: 'string',
    },
  ],
  customConfig: {},
};
