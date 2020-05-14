"use strict";

const config = require("./config");
const request = require("request");

module.exports = class GraphAPi {
    static callSendAPI(requestBody) {
        // Send the HTTP request to the Messenger Platform
        console.log("Called");
        request(
          {
            uri: "https://graph.facebook.com/v6.0/me/messages?access_token=EAAPZCRBu1SEgBABu99UY5m9xskRUdsN12xZCejsdWlxQSSZAWP77j7v2b9ZBXOWxVquQRRDCp9ZBXXKoZBbbFc8caIbXdZCClJxG8UrKcZCUzRrZAR3pW2mbVbdpxODQnerlT1US02mXvAdTCLwJZBDSzb5D8ho29K68Y4bB4CwHHbhgZDZD",
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