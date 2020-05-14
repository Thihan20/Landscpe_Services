"use strict";
require('./firebase-config');

const i18n = require("../../i18n.config");
const config = require("../services/config");
const firebase = require("firebase-admin");
const GraphAPi = require("./graph-api");
const Response = require("./response");
const Receive = require('./receive');

let db = firebase.firestore();

module.exports = class Admin {
    // Constructor
    constructor(senderPsid) {
        this.senderPsid = senderPsid;
    }


    // Get admin access
    getAdminAccess(senderPsid) {

        // Welcome admin 
        let Welcome = Response.genText(i18n.__("admin.welcome"));
        let curation = Response.genButtonTemplate(i18n.__("service.help"), [
            Response.genPostbackButton(i18n.__("service.service"), "ADMIN_SERVICE"),
            Response.genWebUrlButton(i18n.__("service.product"), `${config.appUrl}` + "/admin/products/" + senderPsid)

        ]);

        return [Welcome, curation];

    }

    // Admin service
    getAdminService(senderPsid) {
        db.collection("Services").orderBy('weight').get()
            .then(function (querySnapshot) {
                var services = [];
                querySnapshot.forEach(function (doc) {
                    let service = {
                        type: "postback",
                        title: doc.data().ServiceName,
                        payload: "ADMIN_" + doc.data().payLoad
                    }
                    services.push(service);
                });

                let response = {
                    attachment: {
                        type: "template",
                        payload: {
                            template_type: "button",
                            text: i18n.__("service.help"),
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

    // Get plant service
    getPlantService(senderPsid, payLoad) {
        let start = null;
        let end = null;
        if (payLoad == "ADMIN_PLANT") {
            start = 1; end = 3;
        } else if (payLoad == "ADMIN_PLANT_CONTINUE") {
            start = 4; end = 6;
        }

        db.collection("Plant_Service").orderBy('weight').startAt(start).endAt(end).get()
            .then(function (querySnapshot) {
                var services = [];
                querySnapshot.forEach(function (doc) {
                    let service = {
                        type: "postback",
                        title: doc.data().type,
                        payload: "ADMIN_" + doc.data().payLoad
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

    // Ask process
    askProcess(senderPsid, payLoad) {
        let collection = null;
        switch (payLoad) {
            case "ADMIN_PLANT_TREE":
                collection = "Plant_Trees";
                break;
            case 'ADMIN_PLANT_MEDIUM':
                collection = "Plant_Medium";
                break;
            case "ADMIN_PLANT_CREEPERS":
                collection = "Plant_Creepers";
                break;
            case "ADMIN_PLANT_GROUND_COVER":
                collection = "Plant_Ground_Cover";
                break;
            case 'ADMIN_GRASS_REAL':
                collection = "Grass_Real";
                break;
            case 'ADMIN_GRASS_ARTIFICIAL':
                collection = "Grass_Artificial";
                break;
            case 'ADMIN_MAINTENANCE_PLANT':
                collection = "Maintenance_Plants";
            case 'ADMIN_MAINTENANCE_GRASS':
                collection = "Maintenance_Grass";
        }
        let option = Response.genButtonTemplate(i18n.__("service.help"), [
            Response.genWebUrlButton(i18n.__("admin.option.create"), `${config.appUrl}` + "/create/" + collection + "/" + senderPsid),
            Response.genPostbackButton(i18n.__("admin.option.UDelete"), payLoad + "_UDELETE"),

        ]);

        let requestBody = {
            recipient: {
                id: senderPsid
            },
            message: option
        };
        GraphAPi.callSendAPI(requestBody);
    }

    // Get grass
    getGrassService(senderPsid) {
        db.collection("Grass_Service").orderBy('weight').get()
            .then(function (querySnapshot) {
                var services = [];
                querySnapshot.forEach(function (doc) {
                    let service = {
                        type: "postback",
                        title: doc.data().type,
                        payload: "ADMIN_" + doc.data().payLoad
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

    getMaintenanceService(senderPsid) {
        db.collection("Maintenance_Service").get()
            .then(function (querySnapshot) {
                var services = [];
                querySnapshot.forEach(function (doc) {
                    let service = {
                        type: "postback",
                        title: doc.data().type,
                        payload: "ADMIN_" + doc.data().payLoad
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

    // Handle payload
    handlePayload(payload) {
        let payLoad = payload;
        console.log(payLoad);
        switch (payload) {
            case 'ADMIN_SERVICE':
                this.getAdminService(this.senderPsid);
            case "ADMIN_PLANT":
            case "ADMIN_PLANT_CONTINUE":
                this.getPlantService(this.senderPsid, payLoad);
                break;
            case 'ADMIN_GRASS':
                this.getGrassService(this.senderPsid);
                break;
            case 'ADMIN_MAINTENANCE':
                this.getMaintenanceService(this.senderPsid);
                break;
            case "ADMIN_PLANT_TREE":
            case 'ADMIN_PLANT_MEDIUM':
            case "ADMIN_PLANT_CREEPERS":
            case "ADMIN_PLANT_GROUND_COVER":
            case 'ADMIN_GRASS_REAL':
            case 'ADMIN_GRASS_ARTIFICIAL':
            case 'ADMIN_MAINTENANCE_PLANT':
            case 'ADMIN_MAINTENANCE_GRASS': 
                this.askProcess(this.senderPsid, payLoad);
                break;

            case "ADMIN_PLANT_TREE_UDELETE":
            case 'ADMIN_PLANT_MEDIUM_UDELETE':
            case "ADMIN_PLANT_CREEPERS_UDELETE":
            case "ADMIN_PLANT_GROUND_COVER_UDELETE":
            case 'ADMIN_GRASS_REAL_UDELETE':
            case 'ADMIN_GRASS_ARTIFICIAL_UDELETE':
                this.updateDelete(this.senderPsid, payLoad);
                break;
        }
    }
    // Check for update delete
    updateDelete(senderPsid, payLoad) {
        let collectionName = null;
        switch (payLoad) {
            case 'ADMIN_PLANT_TREE_UDELETE':
                collectionName = "Plant_Trees";
                break;
            case 'ADMIN_PLANT_MEDIUM_UDELETE':
                collectionName = "Plant_Medium";
                break;
            case "ADMIN_PLANT_CREEPERS_UDELETE":
                collectionName = "Plant_Creepers";
                break;
            case "ADMIN_PLANT_GROUND_COVER_UDELETE":
                collectionName = "Plant_Ground_Cover";
                break;
            case 'ADMIN_GRASS_REAL_UDELETE':
                collectionName = "Grass_Real";
                break;
            case 'ADMIN_GRASS_ARTIFICIAL_UDELETE':
                collectionName = "Grass_Artificial";
                break;
        }
        this.showUpdateDeleteUI(senderPsid, collectionName);
    }

    // show UI
    showUpdateDeleteUI(senderPsid, collectionName) {
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
                                title: "Update",
                                url: `${config.appUrl}` + "/update/" + collectionName + "/" + doc.data().title + "/" + senderPsid,
                                messenger_extensions: true,
                                "webview_height_ratio": "tall",
                            },
                            {
                                type: "web_url",
                                title: "Delete",
                                url: `${config.appUrl}` + "/delete/" + collectionName + "/" + doc.data().title + "/" + senderPsid,
                                messenger_extensions: true,
                                "webview_height_ratio": "tall",
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

}