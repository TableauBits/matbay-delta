// Create a copy of this file in the same directory and name it either :
//    * `environment.ts` for production
//    * `environment.development.ts` for development/debug.

// All variables are mandatory for proper fonctionality.
export const environment = {
  // The name of the configuration. Should be either "production" or "development".
  name: 'template',

  // Variables related to the Auth0 configuration
  auth0: {
    domain: "YOUR_AUTH0_DOMAIN",      // The Auth0 domain of your configured application.
    client: "YOUR_AUTH0_CLIENT_ID",   // The ClientID of your Auth0 application.
  },

  // Variables necessary for proper communication with the backend.
  server: {
    domain: "YOUR_SERVER_DOMAIN",         // Domain name of your backend instance
    httpProtocol: "YOUR_HTTP_PROTOCOL",   // HTTP protocol (should be "http://" or "https://")
    wsProtocol: "YOUR_WS_PROTOCOL"        // Websocket protocol (should be "ws://" or "wss://")
  }
}
