import React from "react";
import { MsalAuthenticationTemplate, useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import AuthProvider from "./components/AuthProvider";
import Transcript from "./components/Transcript";

const App = () => {
    return (
        <AuthProvider>
            <MsalAuthenticationTemplate interactionType="redirect" authenticationRequest={loginRequest}>
                <Transcript />
            </MsalAuthenticationTemplate>
        </AuthProvider>
    );
};

export default App;
