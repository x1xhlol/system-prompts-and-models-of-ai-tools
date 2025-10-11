// typed as any, since it accepts the _real_ js clients, not the interface we otherwise expect
export function getAppIdAndApiKey(searchClient) {
  var transporter = searchClient.transporter || {};
  var headers = transporter.headers || transporter.baseHeaders || {};
  var queryParameters = transporter.queryParameters || transporter.baseQueryParameters || {};
  var APP_ID = 'x-algolia-application-id';
  var API_KEY = 'x-algolia-api-key';
  var appId = headers[APP_ID] || queryParameters[APP_ID];
  var apiKey = headers[API_KEY] || queryParameters[API_KEY];
  return {
    appId: appId,
    apiKey: apiKey
  };
}