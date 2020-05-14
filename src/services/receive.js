"use strict";

const i18n = require("../../i18n.config");
const Plant = require("./plant");
const Grass = require("./grass");
const GraphAPi = require("./graph-api");
const Response = require("./response");
const Maintenance = require("./maintenance");
const Admin = require("./admin");

// Receive class
module.exports = class Receive {
    // Constructor 
    constructor(senderPsid, webhookEvent) {
        this.senderPsid = senderPsid;
        this.webhookEvent = webhookEvent;
    }

    // Check the message and call the appropriate handle function 
    handleMessage() {
        let event = this.webhookEvent;
        let responses;

        try {
            // Message event
            if (event.message) {
                let message = event.message;

                // For quick reply
                if (message.quick_reply) {
                    // responses = this.handleQuickReply();
                    console.log("Quick reply");
                }

                // For attachments
                if (message.attachments) {
                    // responses = this.handleAttachmentMessage();
                    console.log("Attachment");
                }

                // For text
                if (message.text) {
                    responses = this.handleTextMessage();
                }
            }

            // Postback event
            if (event.postback) { 
                responses = this.handlePostback();
            }

            // Referral event
            if (event.referral) {
                // responses = this.handleReferral();
                console.log("Referral");
            }
        } catch (error) {
            console.error(error);
            responses = {
                text: `An error has occured: '${error}'.`
            };
        }
    
        // If array response, reply with delay
        if (Array.isArray(responses)) {
            let delay = 0;
            for (let response of responses) {
                this.sendMessage(response, delay * 2000);
                delay++;
            }
        } else {
            this.sendMessage(responses);
        }
    }

    // Handle messages event with text
    handleTextMessage() {
        let response;
        let message = this.webhookEvent.message.text;
        // For admin access
        if (message == "Admin access") {
            let admin = new Admin(this.senderPsid);
            response = admin.getAdminAccess(this.senderPsid);

            console.log(response);

        }

        if (message == "Exit admin") {
            response = Response.genNuxMessage(this.senderPsid);
        }

        return response;
    }

    // Handle postback event
    handlePostback() {
        let postback = this.webhookEvent.postback;
        let payload;
        
        if (postback.referral && postback.referral.type == "OPEN_THREAD") {
            payload = postback.referral.ref;
        } else {
            // Get the payload of the postback
            payload = postback.payload;
        }
        return this.handlePayload(payload.toUpperCase());
    }

    // Handle payload
    handlePayload(payload) {

        console.log(payload);
        let response;

        // Get started payload
        if (payload == "<GET_STARTED_PAYLOAD>") {
            response = Response.genLocaleMessage();
        }

        // Set localization
        // English
        if (payload == "EN") {
            i18n.setLocale(payload);
            response = Response.genNuxMessage(this.senderPsid);
        }

        // Myanmar
        if(payload == "MM") {
            i18n.setLocale(payload);
            response = Response.genNuxMessage(this.senderPsid);
        }

        if (payload == "SERVICE") {
            Response.getService(this.senderPsid);
        }

        // Plant service
        if(payload.includes("PLANT")){
            let plant = new Plant(this.senderPsid, this.webhookEvent);

            plant.handlePayload(payload);
        }

        // Back to options
        if(payload.includes("BACK")){
            response = Response.genNuxMessage(this.senderPsid);
        }

        // Grass service
        if(payload.includes("GRASS")){
            let grass = new Grass(this.senderPsid, this.webhookEvent);

            grass.handlePayload(payload);
        }

        // Maintenance service
        if(payload.includes("MAINTENANCE")){
            let maintenance = new Maintenance(this.senderPsid, this.webhookEvent);

            maintenance.handlePayload(payload);
        }

        // Product
        if(payload.includes("PRODUCT")){
            // TODO:: 
        }    
        
        // Admin
        if (payload.includes("ADMIN")){
            let admin = new Admin(this.senderPsid);
            admin.handlePayload(payload);
        }

        if (payload == "TALK_WITH_ADMIN") {
            response = Response.talkWithAdmin(this.senderPsid);
        }

        return response;
    }

    // Send message function 
    sendMessage(response, delay = 0) {
        // Check if there is delay in the response
        if ("delay" in response) {
            delay = response["delay"];
            delete response["delay"];
        }

        // Construct the message body
        let requestBody = {
            recipient: {
                id: this.senderPsid
            },
            message: response
        };
        // Response with timeout
        setTimeout(() => GraphAPi.callSendAPI(requestBody), delay);
    }

    firstEntity(nlp, name) {
        return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
    }
}