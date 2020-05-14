"use strict";
require('./firebase-config');

const i18n = require("../../i18n.config");
const config = require("../services/config");
const firebase = require("firebase-admin");
const GraphAPi = require("./graph-api");

let db = firebase.firestore();

module.exports = class Maintenance {
    // Constructor
    constructor(senderPsid, webhookEvent) {
        this.senderPsid = senderPsid;
        this.webhookEvent = webhookEvent;
    }

    // Get maintenance service
    getMaintenanceService(senderPsid) {
        db.collection("Maintenance_Service").orderBy('weight').get()
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
                            text: i18n.__("maintenance_service.help"),
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

    // Get list
    getList(senderPsid, payLoad) {
        let collectionName = null;

        switch (payLoad) {
            case "MAINTENANCE_PLANT":
                collectionName = "Maintenance_Plants";
                break;
            case "MAINTENANCE_GRASS":
                collectionName = "Maintenance_Grass";
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
        let payLoad = payload;
        switch (payload) {
            case 'MAINTENANCE':
                this.getMaintenanceService(this.senderPsid);
                break;
            case 'MAINTENANCE_PLANT' : 
            case 'MAINTENANCE_GRASS' : 
                console.log(payload);
                this.getList(this.senderPsid, payLoad);
        }
    }
}