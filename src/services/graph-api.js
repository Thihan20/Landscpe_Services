"use strict";

const config = require("./config");
const request = require("request");

module.exports = class GraphAPi {
    static callSendAPI(requestBody) {
        // Send the HTTP request to the Messenger Platform
        console.log("Called");
        request(
          {
            uri: "https://graph.facebook.com/v6.0/me/messages?access_token=EAAJMmhtDAIABAJnkg4GKznfQCSAVwcuhVRCWNXBawym7e8PhJiw61AnhUIxnzuFpZCxt7QPnIIIzHoG3F91qdu2xZC6y1na1V7TvyDGhjTbE2fi7AHLt7ZCqi8BTXvz2WYggrssMTzeC5prZAXDrey600NGtEnhrmvBBilfcLbxecXmRjR4v",
            method: "POST",
            json: requestBody
          },
          error => {
            if (error) {
              console.error("Unable to send message:", error);
            }
          }
        );
      }
}