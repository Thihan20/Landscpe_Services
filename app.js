// Config
require('dotenv').config();
require('./src/services/firebase-config');

const express = require('express');
const Receive = require('./src/services/receive');
const bodyParser = require('body-parser');
const config = require("./src/services/config");
const app = express();
const port = process.env.PORT || 3000;
const ejs = require("ejs");
const GraphAPi = require("./src/services/graph-api");
const Response = require('./src/services/response');
const firebase = require("firebase-admin");
const i18n = require("./i18n.config");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/src/view');


// Log to know the server run 
app.listen(port, () => console.log('Express server is running on port 8081'));

// Prepare to use bootstrap
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));



let db = firebase.firestore();
let bucket = firebase.storage().bucket();



// Delete route
app.get("/delete/:collectionName/:title/:senderPsid", function (req, res) {
    let title = req.params.title;
    let collectionName = req.params.collectionName;
    let senderPsid = req.params.senderPsid;

    db.collection(collectionName).where("title", "==", title)
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                let data = {
                    doc_id: doc.id,
                    title: doc.data().title,
                    image_url: doc.data().image_url,
                    subtitle: doc.data().subtitle
                }
                res.render('delete.ejs', { heading: "Deleting data", data: data, sender_id: senderPsid, collection: collectionName });
            });
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });
});

app.post("/delete", function (req, res) {
    let doc_id = req.body.doc_id;
    let collection = req.body.collection;
    let senderPsid = req.body.senderID;

    db.collection(collection).doc(doc_id).delete()
        .then(function () {
            let message = "Successfully deleted the data."
            successUpdateDelete(senderPsid, message);
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });
});

// Update route (get)
app.get("/update/:collectionName/:title/:senderPsid", function (req, res) {
    let title = req.params.title;
    let collectionName = req.params.collectionName;
    let senderPsid = req.params.senderPsid;

    db.collection(collectionName).where("title", "==", title)
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                let data = {
                    doc_id: doc.id,
                    title: doc.data().title,
                    image_url: doc.data().image_url,
                    subtitle: doc.data().subtitle
                }
                res.render('update.ejs', { heading: "Updating data", data: data, sender_id: senderPsid, collection: collectionName });
            });
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });
});

// Update route (post)
app.post('/update', function (req, res) {
    let collection = req.body.collection;
    let title = req.body.title;
    let subtitle = req.body.subtitle;
    let image_url = req.body.image_url;
    let doc_id = req.body.doc_id;
    let senderPsid = req.body.senderID;

    if (subtitle == undefined) {
        subtitle = "";
    }
    console.log(subtitle);

    db.collection(collection).doc(doc_id).update({
        title: title,
        subtitle: subtitle,
        image_url: image_url
    }).then(success => {
        let message = "Successfully updated the data.";
        successUpdateDelete(senderPsid, message)
    }).catch(error => {
        console.log(error);
    });
});

// define the first route
app.get("/Order/:senderId/:collectionName/:title", function (req, res) {
    let senderPsid = req.params.senderId;
    let collection = req.params.collectionName;
    let title = req.params.title;
    switch (collection) {
        case 'Plant_Trees':
            service = "Plant";
            type = "Tree"
            break;
        case 'Plant_Creepers':
            service = "Plant";
            type = "Creepers"
            break;
        case 'Plant_Medium':
            service = "Plant";
            type = "Medium plant"
            break;
        case 'Plant_Ground_Cover':
            service = "Plant";
            type = "Ground Cover"
            break;
        case 'Grass_Real':
            service = "Grass";
            type = "Real"
            break;
        case 'Grass_Artificial':
            service = "Grass";
            type = "Artificial"
            break;
        case 'Maintenance_Plants' : 
            service = "Maintenance";
            type = "Plant";
            break;
        case 'Maintenance_Plants' : 
            service = "Maintenance";
            type = "Plant";
            break;
        case 'Products' : 
            service = "Products";
            type = 'product';
            break;
    }

    res.render('order.ejs', { service: service, type: type, title: title, senderId: senderPsid });
});

app.post("/Order", function (req, res) {
    let service = req.body.service;
    let title = req.body.title;
    let name = req.body.name;
    let phone = req.body.phone;
    let address = req.body.address;
    let senderPsid = req.body.senderID;
    let type = req.body.type;
    let booking_number = generateRandom(5);

    db.collection("User_Order").add({
        username: name,
        service: service,
        service_type: type,
        title: title,
        phone_no: phone,
        address: address,
        booking_number: booking_number
    }).then(success => {
        successOrder(senderPsid, booking_number, name);
    }).catch(error => {
        console.log(error);
    });
});

// create request
app.get("/create/:collection/:senderPsid", function (req, res) {
    let collection = req.params.collection;
    let senderPsid = req.params.senderPsid;
    let heading = null;
    switch (collection) {
        case 'Plant_Trees':
            heading = "Add new tree";
            break;
        case 'Plant_Creepers':
            heading = "Add new Creeper";
            break;
        case 'Plant_Medium':
            heading = "Add new medium plant";
            break;
        case 'Plant_Ground_Cover':
            heading = "Add new ground cover";
            break;
        case 'Grass_Real':
            heading = "Add new real grass";
            break;
        case 'Grass_Artificial':
            heading = "Add new artificial grass";
            break;
        case 'Products' : 
            heading = "Add new products";
            break;
    }

    res.render('create.ejs', { heading: heading, senderId: senderPsid, collection: collection });
});

app.post("/create", function (req, res) {
    let collection = req.body.collection;
    let title = req.body.title;
    let subtitle = req.body.subtitle;
    let image_url = req.body.image_url;
    let senderPsid = req.body.senderID;
    console.log(collection);

    db.collection(collection).add({
        title: title,
        subtitle: subtitle,
        image_url: image_url

    }).then(success => {
        let message = "Successfully added new."
        successUpdateDelete(senderPsid, message);
    }).catch(error => {
        console.log(error);
    });
});

// Products
app.get("/products/:senderId", function(req, res) {
    let collection = "Products";
    let senderPsid = req.params.senderId;
    let order = i18n.__("order.title");
    db.collection(collection).get()
    .then(function (querySnapshot) {
        var products = [];
        querySnapshot.forEach(function (doc) {
            let data = {
                title : doc.data().title,
                image_url : doc.data().image_url,
                subtitle : doc.data().subtitle
            }
            products.push(data);
        });
        res.render('product.ejs', { heading: "Products", products:products, collection: collection, order: order, senderPsid: senderPsid});
    })
    .catch(function (error) {
        console.log("Error getting documents: ", error);
    });
});

app.get("/admin/products/:senderId", function(req, res) {
    console.log("Called");
    let collection = "Products";
    let senderPsid = req.params.senderId;
    let order = i18n.__("order.title");
    db.collection(collection).get()
    .then(function (querySnapshot) {
        var products = [];
        querySnapshot.forEach(function (doc) {
            let data = {
                title : doc.data().title,
                image_url : doc.data().image_url
            }
            products.push(data);
        });
        res.render('adminProducts.ejs', { heading: "Products", products:products, collection: collection, order: order, senderPsid: senderPsid});
    })
    .catch(function (error) {
        console.log("Error getting documents: ", error);
    });
});

// Verify hook
app.get('/', (req, res) => {

    // Verify token
    let VERIFY_TOKEN = "garden-bot";

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});

// Post request from web hook
app.post('/', (req, res) => {
    let body = req.body;

    if (body.object === 'page') {

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');

        // Iterates over each entry
        body.entry.forEach(function (entry) {

            // Gets the message
            let webhook_event = entry.messaging[0];

            // Discard uninteresting events
            if ("read" in webhook_event) {
                // console.log("Got a read event");
                return;
            }

            if ("delivery" in webhook_event) {
                // console.log("Got a delivery event");
                return;
            }

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            // For response
            let receiveMessage = new Receive(sender_psid, webhook_event);
            let response = receiveMessage.handleMessage();

            return response;
        });

    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
});


// Profile
app.get("/profile", (req, res) => {
    let mode = res.query["mode"];
    let token = res.query["verify_token"];
});


const successOrder = (senderId, order_number, order_user_name) => {
    let successMessage = Response.genText(i18n.__("Order.success"));
    let thankUMessage = Response.genText(i18n.__("Order.thank", {
        order_user_name: order_user_name
    }));
    let contactMessage = Response.genText(i18n.__("Order.contact"));

    let test = Response.genButtonTemplate(i18n.__("continue.title"), [
        Response.genPostbackButton(i18n.__("continue.continue"), "BACK")
    ]);

    let responses = [
        successMessage,
        thankUMessage,
        contactMessage,
        test
    ];
    let delay = 0;
    for (let response of responses) {
        sendMessage(response, senderId, delay * 2000);
        delay++;
    }
}

// Send message function 
const sendMessage = (response, senderPsid, delay = 0) => {
    // Check if there is delay in the response
    if ("delay" in response) {
        delay = response["delay"];
        delete response["delay"];
    }

    // Construct the message body
    let requestBody = {
        recipient: {
            id: senderPsid
        },
        message: response
    };
    // Response with timeout
    setTimeout(() => GraphAPi.callSendAPI(requestBody), delay);
}

const successUpdateDelete = (senderPsid, message) => {
    let response = Response.genText(message);
    let requestBody = CreateRequestBody(response, senderPsid)
    GraphAPi.callSendAPI(requestBody);
}

const CreateRequestBody = (response, senderId) => {
    let requestBody = {
        recipient: {
            id: senderId
        },
        message: response
    };

    return requestBody;
}

const generateRandom = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
