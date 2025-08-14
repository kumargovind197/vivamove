
// This file is gitignored. Create a service account in your Firebase project,
// generate a new private key, and place the JSON here.
//
// DO NOT check this file into source control.

import "dotenv/config";

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


// Type guard to ensure all necessary fields are strings
function isServiceAccount(account: any): account is admin.ServiceAccount {
    return (
        typeof account.type === 'string' &&
        typeof account.project_id === 'string' &&
        typeof account.private_key_id === 'string' &&
        typeof account.private_key === 'string' &&
        typeof account.client_email === 'string' &&
        typeof account.client_id === 'string' &&
        typeof account.auth_uri === 'string' &&
        typeof account.token_uri === 'string' &&
        typeof account.auth_provider_x509_cert_url === 'string' &&
        typeof account.client_x509_cert_url === 'string'
    );
}

if (!isServiceAccount(serviceAccountConfig)) {
    const missingKeys = Object.entries(serviceAccountConfig)
        .filter(([_, value]) => typeof value !== 'string' || value === '')
        .map(([key]) => key);

    console.error("Service account configuration is invalid. The following keys are missing or not strings in your environment variables:", missingKeys.join(', '));
    // Provide a default empty object to avoid crashing on import, but initialization will fail.
    // The console error above is the true source of the problem.
    module.exports.serviceAccount = {};
} else {
    module.exports.serviceAccount = serviceAccountConfig;
}

