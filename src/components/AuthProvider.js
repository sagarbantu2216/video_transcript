import React from "react";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "../authConfig";

const AuthProvider = ({ children }) => {
    return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
};

export default AuthProvider;
