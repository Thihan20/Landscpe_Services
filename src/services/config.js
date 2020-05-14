"use strict";

// To read vars
require("dotenv").config();

// Required environment variables
const ENV_VARS = [
    "PAGE_ID",
    "APP_ID",
    "PAGE_ACCESS_TOKEN",
    "APP_SECRET",
    "VERIFY_TOKEN",
    "APP_URL",
    "SHOP_URL"
  ];

module.exports = {
    
    // Messenger Platform API
    mPlatformDomain: "https://graph.facebook.com",
    mPlatformVersion: "v6.0",

    // URL of your app domain
    appUrl: process.env.APP_URL,

    // Webview url
    plantOrderUrl : process.env.PLANT_ORDER_URL,

    pageAccesToken: process.env.PAGE_ACCESS_TOKEN,

    // Get mobile platform api
    get mPlatfom() {
        return this.mPlatformDomain + "/" + this.mPlatformVersion;
    }
}