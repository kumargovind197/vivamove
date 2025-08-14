
// This file is gitignored. Create a service account in your Firebase project,
// generate a new private key, and place the JSON here.
//
// DO NOT check this file into source control.

import "dotenv/config";
import type * as admin from 'firebase-admin';

const serviceAccountConfig = {
  "type": "service_account",
  "project_id": process.env.PROJECT_ID,
  "private_key_id": process.env.PRIVATE_KEY_ID,
  "private_key": process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
  "client_email": process.env.CLIENT_EMAIL,
  "client_id": process.env.CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": process.env.CLIENT_X509_CERT_URL
};


// Type guard to ensure all necessary fields are strings and not undefined
function isServiceAccount(account: any): account is admin.ServiceAccount {
    return (
        !!account.type &&
        !!account.project_id &&
        !!account.private_key_id &&
        !!account.private_key &&
        !!account.client_email &&
        !!account.client_id &&
        !!account.auth_uri &&
        !!account.token_uri &&
        !!account.auth_provider_x509_cert_url &&
        !!account.client_x509_cert_url
    );
}

if (!isServiceAccount(serviceAccountConfig)) {
    const missingKeys = Object.entries(serviceAccountConfig)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

    console.error(
        "Service account configuration is invalid. The following keys are missing from your .env file:",
        missingKeys.join(', ')
    );
    
    // Throw an error during build if the config is invalid
    throw new Error("Missing required Firebase service account credentials in .env file.");
}

// Use 'export' for ES Modules
export const serviceAccount = serviceAccountConfig;
