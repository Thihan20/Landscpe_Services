"use strict";
require('./firebase-config');

const i18n = require("../../i18n.config");
const config = require("../services/config");
const firebase = require("firebase-admin");
const GraphAPi = require("./graph-api");

let db = firebase.firestore();

module.exports = class Plant {
    // Constructor
    constructor(senderPsid, webhookEvent) {
        this.senderPsid = senderPsid;
        this.webhookEvent = webhookEvent;
    }

    // Get plant service
    getPlantService(senderPsid, payLoad) {
        let start = null;
        let end = null;
        if (payLoad == "PLANT") {
            start = 1; end = 3;
        } else if (payLoad == "PLANT_CONTINUE") {
            start = 4; end = 6;
        }

        db.collection("Plant_Service").orderBy('weight').startAt(start).endAt(end).get()
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
                console.log(services);

                let response = {
                    attachment: {
                        type: "template",
                        payload: {
                            template_type: "button",
                            text: i18n.__("plant_service.help"),
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

    // Get tree
    getList(senderPsid, payload) {
        let collectionName = null;
    
        switch (payload) {
            case "PLANT_TREE":
                collectionName = "Plant_Trees";
                break;
            case "PLANT_MEDIUM":
                collectionName = "Plant_Medium";
                break;
            case "PLANT_CREEPERS":
                collectionName = "Plant_Creepers";
                break;
            case "PLANT_GROUND_COVER":
                collectionName = "Plant_Ground_Cover";
                break;
        }
        
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
                    console.log(templates);
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
        let payLoad = payload;

        switch (payload) {
            case "PLANT":
            case "PLANT_CONTINUE":
                this.getPlantService(this.senderPsid, payLoad);
                break;

            // Tree case 
            case "PLANT_TREE":
            case 'PLANT_MEDIUM':
            case "PLANT_CREEPERS":
            case "PLANT_GROUND_COVER":
                this.getList(this.senderPsid, payload);
                break;
        }
    }
}