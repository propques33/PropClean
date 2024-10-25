const functions = require("firebase-functions");
const admin = require("firebase-admin");

const serviceAccount = require("./path-to-service-account.json"); // Path to your service account key file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://<YOUR-DATABASE-NAME>.firebaseio.com" // Replace with your Realtime Database URL
});

exports.createUser = functions.https.onCall(async (data, context) => {
  // Security check - allow only authenticated users to create new users
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Only authenticated users can add new users.");
  }

  const { email, password, role, companyName, subcompanyName } = data;

  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });

    const userData = {
      email: email,
      role: role,
      blocked: false,
      companyName: companyName,
      subcompanyName: subcompanyName,
    };

    // Add the user to your Realtime Database
    await admin.database().ref("users/" + userRecord.uid).set(userData);

    return { message: "User created successfully", uid: userRecord.uid };
  } catch (error) {
    throw new functions.https.HttpsError("unknown", error.message, error);
  }
});
