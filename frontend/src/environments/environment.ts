export const environment = {
  name: 'production',
  auth0: {
    domain: import.meta.env["NG_APP_AUTH0_DOMAIN"],
    client: import.meta.env["NG_APP_AUTH0_CLIENT"],
  },
  server: {
    url: import.meta.env["NG_APP_SERVER_URL"],
    ws: import.meta.env["NG_APP_WS_URL"]
  }
};
