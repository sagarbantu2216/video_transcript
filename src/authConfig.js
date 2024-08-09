import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
    auth: {
        clientId: "dc83bc75-a084-48e5-8c88-010d511a1a7a",
        authority: "https://login.microsoftonline.com/7f88a877-91f6-4935-ae6c-345ce3ef9bec",
        redirectUri: "/"
    },
    cache: {
        cacheLocation: "localStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false // Set this to "true" if you're having issues on IE11 or Edge
    }
};

const loginRequest = {
    scopes: ["https://graph.microsoft.com/.default"]
};
 
const msalInstance = new PublicClientApplication(msalConfig);

export { msalInstance, loginRequest };
