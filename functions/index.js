const functions = require("firebase-functions");
const app = require("./backend/server");

exports.api = functions.https.onRequest(app);
