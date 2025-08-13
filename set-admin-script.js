// This is a standalone script to be run from your local machine's terminal.
// It is NOT part of the Next.js application.
//
// HOW TO USE:
// 1. Install Node.js on your computer if you haven't already.
// 2. Install the Firebase Admin SDK by running this command in your terminal:
//    npm install firebase-admin
// 3. Download your Firebase service account key:
//    - Go to your Firebase project console.
//    - Click the gear icon > Project settings.
//    - Go to the "Service accounts" tab.
//    - Click "Generate new private key" and save the JSON file.
//    - RENAME the downloaded file to "service-account-key.json".
//    - PLACE this file in the SAME directory as this script.
// 4. Update the `userEmail` and `roleToSet` variables below.
// 5. Run the script from your terminal with this command:
//    node set-admin-script.js
//
// =========================================================================================

const admin = require('firebase-admin');

// --- IMPORTANT ---
// **UPDATE THESE VALUES**
const userEmail = "REPLACE_WITH_THE_USER_EMAIL@example.com";
const roleToSet = { admin: true }; // To make a user an admin
// OR
// const roleToSet = { clinic: true }; // To make a user a clinic user

// -----------------


// --- IMPORTANT ---
// Make sure the `service-account-key.json` file is in the same folder as this script.
const serviceAccount = require('./service-account-key.json');
// -----------------

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setCustomClaim() {
    if (userEmail === "REPLACE_WITH_THE_USER_EMAIL@example.com") {
        console.error("ERROR: Please update the 'userEmail' variable in this script.");
        return;
    }

    try {
        console.log(`Fetching user with email: ${userEmail}...`);
        const user = await admin.auth().getUserByEmail(userEmail);

        console.log(`Found user: ${user.uid}. Setting custom claims...`);
        await admin.auth().setCustomUserClaims(user.uid, roleToSet);

        console.log("\n✅ SUCCESS!");
        console.log(`The user '${userEmail}' has been granted the following roles:`, roleToSet);
        console.log("They may need to log out and log back in for the changes to take effect.");

    } catch (error) {
        console.error("\n❌ ERROR:");
        if (error.code === 'auth/user-not-found') {
            console.error(`No user found with the email '${userEmail}'. Please make sure the user exists in Firebase Authentication.`);
        } else {
            console.error("An unexpected error occurred:", error.message);
        }
    }
}

setCustomClaim();
