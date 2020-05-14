"use strict";
require('./firebase-config');

const i18n = require("../../i18n.config");
const config = require("../services/config");
const firebase = require("firebase-admin");
const GraphAPi = require("./graph-api");

let db = firebase.firestore();

module.exports = class Grass {
    // Constructor
    constructor(senderPsid, webhookEvent) {
        this.senderPsid = senderPsid;
        this.webhookEvent = webhookEvent;
    }

    // Get grass service
    getGrassService(senderPsid) {
        db.collection("Grass_Service").orderBy('weight').get()
            .then(function (querySnapshot) {
                var services = [];
                querySnapshot.forEach(function (doc) {
                    let service = {
                        type: "postback",
                        title: doc.data().type,
                        payload: doc.data().payLoad
                    }
                    services.push(service);
                });
                let response = {
                    attachment: {
                        type: "template",
                        payload: {
                            template_type: "button",
                            text: i18n.__("grass_service.help"),
                            buttons: services
                        }
                    }
                }
                let requestBody = {
                    recipient: {
                        id: senderPsid
                    },
                    message: response
                };
                GraphAPi.callSendAPI(requestBody);
            })
            .catch(function (error) {
                console.log("Error getting documents: ", error);
            });
    }

    // Get List
    getList(senderPsid, payLoad) {
        let collectionName = null;

        switch (payLoad) {
            case "GRASS_REAL":
                collectionName = "Grass_Real";
                break;
            case "GRASS_ARTIFICIAL":
                collectionName = "Grass_Artificial";
                break;
        }
        console.log(collectionName);
        db.collection(collectionName).get()
            .then(function (querySnapshot) {
                var templates = [];
                querySnapshot.forEach(function (doc) {
                    let template = {
                        title: doc.data().title,
                        image_url: doc.data().image_url,
                        subtitle: doc.data().subtitle,
                        buttons: [
                            {
                                type: "web_url",
                                title: i18n.__("order.title"),
                                url: `${config.appUrl}` + "/Order/" + senderPsid +"/"+ collectionName + "/" + doc.data().title,
                                messenger_extensions: true,
                                "webview_height_ratio": "tall",
                            },
                            {
                                type: "postback",
                                title: i18n.__("talk_with_admin.title"),
                                payload: "TALK_WITH_ADMIN"
                            }, {
                                type: "postback",
                                title: i18n.__("back.title"),
                                payload: "BACK"
                            }
                        ]
                    }
                    templates.push(template);
                });
                let response = {
                    attachment: {
                        type: "template",
                        payload: {
                            template_type: "generic",
                            image_aspect_ratio: "square",
                            elements: templates
                        }
                    }
                }
                let requestBody = {
                    recipient: {
                        id: senderPsid
                    },
                    message: response
                };
                GraphAPi.callSendAPI(requestBody);
            })
            .catch(function (error) {
                console.log("Error getting documents: ", error);
            });
    }

    // Handle payload
    handlePayload(payload) {
        let response;

        switch (payload) {
            case 'GRASS':
                this.getGrassService(this.senderPsid);
                break;
            case 'GRASS_REAL':
            case 'GRASS_ARTIFICIAL':
                this.getList(this.senderPsid, payload);
                break;
        }
    }
}