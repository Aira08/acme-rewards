// Copy this file to partner-connect.config.ts and fill in real values.
// partner-connect.config.ts is gitignored. Never commit or log the secret key.
import { Scope } from "./partner-connect.types";

export const PC_CONFIG = {
    scheme: 'asensopay',                    // or 'omnipaybusiness'
    cert: 'PASTE_CERT_HERE',                // issued cert
    secretKey: 'PASTE_SECRET_KEY_HERE', 
    redirect_uri: 'acmerewards://cb',       // match the cert exactly
    scopes: [
        'balance:read',
        'collections:read',
        'pay:create'
    ] as Scope[],
};