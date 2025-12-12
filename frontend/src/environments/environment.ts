export const environment = {
  name: 'production',
  auth0: {
    domain: import.meta.env['NG_APP_AUTH0_DOMAIN'],
    client: import.meta.env['NG_APP_AUTH0_CLIENT'],
  },
  server: {
    domain: import.meta.env['NG_APP_SERVER_DOMAIN'],
    httpProtocol: import.meta.env['NG_APP_SERVER_HTTP_PROTOCOL'],
    wsProtocol: import.meta.env['NG_APP_SERVER_WS_PROTOCOL'],
  },
};
