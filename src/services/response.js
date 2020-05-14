"use strict";

require("./firebase-config");
const i18n = require("../../i18n.config");
const firebase = require("firebase-admin");
const GraphAPi = require("./graph-api");
const config = require("./config");

let db = firebase.firestore();

module.exports = class Response {

    // For localization
    static genLocaleMessage() {

        let locale = this.genButtonTemplate("Choose language", [
            this.genPostbackButton('English', 'en'),
            this.genPostbackButton('Myanmar', 'mm')
        ]);

        return locale;
    }

    // Get service
    static getService(senderPsid) {
        db.collection("Services").orderBy('weight').get()
            .then(function (querySnapshot) {
                var services = [];
                querySnapshot.forEach(function (doc) {
                    let service = {
                        type: "postback",
                        title: doc.data().ServiceName,
                        payload: doc.data().payLoad
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

    static talkWithAdmin(){
        let message = Response.genText(i18n.__("talk_with_admin.reply"));
        let conti   = Response.genButtonTemplate(i18n.__("continue.title"), [
            this.genPostbackButton(i18n.__("continue.continue"), "BACK"),
        ]);

        return [message, conti];
    }

    // Get started message
    static genNuxMessage(senderPsid) {
        let welcome = this.genText(i18n.__("get_started.welcome"));
        let help = this.genText(i18n.__("get_started.help"));
        let curation = this.genButtonTemplate(i18n.__("services.choose"), [
            this.genPostbackButton(i18n.__("services.service"), "SERVICE"),
            this.genWebUrlButton(i18n.__("services.product"), `${config.appUrl}` + "/products/" + senderPsid),

        ]);

        return [welcome, help, curation];
    }

    // Test
    static genText(text) {
        let response = {
            text: text
        };

        return response;
    }

    // Quick reply
    static genQuickReply(text, quickReplies) {
        let response = {
            text: text,
            quick_replies: []
        };

        for (let quickReply of quickReplies) {
            response["quick_replies"].push({
                content_type: "text",
                title: quickReply["title"],
                payload: quickReply["payload"]
            });
        }

        return response;
    }

    // Button template
    static genButtonTemplate(title, buttons) {
        let response = {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: title,
                    buttons: buttons
                }
            }
        };

        return response;
    }

    // Postback button
    static genPostbackButton(title, payload) {
        let response = {
            type: "postback",
            title: title,
            payload: payload
        };

        return response;
    }

    // Generic template
    static genericTemplate(image_url, title, subtitle, buttons) {
        let response = {
            title: title,
            image_url: image_url,
            subtitle: subtitle,
            buttons: buttons
        }

        return response;
    }

    // Coursel generic templates
    static genCourselGenericTemplate(templates) {
        let response = {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    image_aspect_ratio: "square",
                    elements: templates
                }
            }
        };


        return response;
    }

    // Web url button
    static genWebUrlButton(title, url) {
        let response = {
            type: "web_url",
            title: title,
            url: url,
            messenger_extensions: true,
            "webview_height_ratio": "tall",
        };

        return response;
    }
}

