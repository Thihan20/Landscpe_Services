"use strict";

const firebase = require("firebase-admin");
// Firebase config
var firebaseConfig = {
    credential: firebase.credential.cert({
   "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
   "client_email": process.env.FIREBASE_CLIENT_EMAIL,
   "project_id": process.env.FIREBASE_PROJECT_ID,    
   }),
   databaseURL: process.env.FIREBASE_DB_URL, 
   storageBucket: process.env.FIREBASE_SB_URL
 };

// Initialize firebase
const fireBase = firebase.initializeApp(firebaseConfig);

module.exports = { fireBase };