const admin = require("firebase-admin");
const functions = require("firebase-functions");

admin.initializeApp();

interface UserRequestData {
  email: string;
  password: string;
  name?: string;
  is_admin?: boolean;
  sectors?: string[];
}

exports.addUser = functions.https.onCall(async (request: UserRequestData|any) => {  
    const data = request.data;
    const auth = request.auth;

    //only admins can perform this action
    if (!auth || !auth.token.admin) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Must be an administrative user to create users.",
        );
    }

    //validating
    if (!data.email || !data.password || !data.name) {
        throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with \"email\", \"password\" and \"name\" arguments.",
        );
    }

    try {
        const userRecord = await admin.auth().createUser({
            email: data.email,
            password: data.password,
            displayName: data.name,
        });

        admin.firestore().collection('users').doc(userRecord.uid).set({
            email_address: data.email,
            name: data.name,
            is_admin: data.is_admin,
            sectors: data.sectors
        });

        // Set custom claims if they are provided in the request
        if (data.is_admin) {
            await admin.auth().setCustomUserClaims(userRecord.uid, {
                admin: true,
            });
        }

        return {
            uid: userRecord.uid,
            message: `Successfully created new user: ${userRecord.uid}`,
        };
    } catch (error: any) {
        console.error("Error creating new user:", error);
        if (error.code === "auth/email-already-exists") {
            throw new functions.https.HttpsError("already-exists", error.message);
        }
        throw new functions.https.HttpsError("internal", "Error creating new user.");
    }
});

exports.changePassword = functions.https.onCall(async (request: UserRequestData|any) => {
    const data = request.data;
    const auth = request.auth;

    //can only change their own password
    if (data.uid != auth.uid) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Can only change your own password.",
        );
    }

    if (!data.password) {
        throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with \"password\"",
        );
    }

    admin.auth().updateUser(auth.uid, {
        password: data.password
    }).then((user: any) => {
        return {
            message: `Successfully updated password: ${user.uid}`,
        }    
    }).catch((error: any) => {
        throw new functions.https.HttpsError("internal", "Error updating password.");
    });
});

exports.updateUser = functions.https.onCall(async (request: UserRequestData|any) => {
    const data = request.data;
    const auth = request.auth;

    //only admins can perform this action
    if (!auth || !auth.token.admin) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Must be an administrative user to update users.",
        );
    }

    try {
        admin.firestore().collection('users').doc(data.uid).update({
            name: data.name,
            is_admin: data.is_admin,
            sectors: data.sectors
        }).then(() => {
            admin.auth().setCustomUserClaims(auth.uid, {
                admin: data.is_admin
            }).then(() => {
                return {
                    message: `Successfully updated user: ${data.uid}`,
                }
            }).catch((error: any) => {
                throw new functions.https.HttpsError("internal", `Error saving claims for user.`);
            });
        }).catch((error: any) => { 
            throw new functions.https.HttpsError("internal", `Error updating user.`);
        });            
    } catch (error: any) {
        throw new functions.https.HttpsError("internal", `Error updating user.`);
    }
});

exports.delUser = functions.https.onCall(async (request: UserRequestData|any) => {
    const data = request.data;
    const auth = request.auth;

    //only admins can perform this action
    if (!auth || !auth.token.admin) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Must be an administrative user to create users.",
        );
    }

    //cannot self remove
    if (data.uid == auth.uid) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Cannot self remove",
        );
    }

    await admin.auth().deleteUser(data.uid);
    admin.firestore().collection('users').doc(data.uid).delete().then(() => {
        return {
            message: `Successfully removed user: ${data.uid}`,
        }
    }).catch((error: any) => {
        throw new functions.https.HttpsError("internal", `Error removing user.`);
    });
});