const express = require("express");
const mongoose = require("mongoose");
const schedule = require("node-schedule");

const http = require("http");
const https = require("https");

require("dotenv").config();
const twilioClient = require("twilio")(process.env.accountSid, process.env.authToken);

const PORT = process.env.PORT || 4500;

const app = express();

app.use(express.urlencoded({ extended: false }));

const db = require("./models");

// local mongo db connection
// const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/chorechat";

// deployed mongo db connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://" + process.env.mongoUser + ":" + process.env.mongoPW + "@ds251158.mlab.com:51158/heroku_5npspkxg";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true }).then(() => {
    console.log("\nMongoose successfully connected to chorechat db\n");
}).catch(err => {
    console.log(err);
});
mongoose.set("useFindAndModify", false);
mongoose.set("useUnifiedTopology", true);

const MessagingResponse = require("twilio").twiml.MessagingResponse;

app.post("/sms", (req, res) => {
    if (req.body.Body.toLowerCase() === "done") {
        db.Roomie.findOneAndUpdate({ phoneNumber: req.body.From }, { choreComplete: true }).then(dbRes => {
            console.log(dbRes);
        }).catch(err => console.log(err));

        const twiml = new MessagingResponse();
        twiml.message("\nThanks for helping to keep the Taj Mahal tidy!\n\nSee you next week!\n\n-1301 Chorechat");

        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
    }
    res.end();
});

app.get("/", (req, res) => {
    res.send("<h2 style='font-family:monospace;font-weight:500;'>chorechat v0.2</h2>");
});

app.get("*", (req,res) => {
    res.redirect("/");
});

const scheduleFunctions = require("./scheduleFunctions.js");
const chores = require("./chores.js");

// Send out the initial weekly chore duties to each roommate
const alertChores = schedule.scheduleJob({dayOfWeek: 2, hour: 8, minute: 30}, () => {
    db.Roomie.find({}).then(dbRes => {
        for (roomie of dbRes) {
            const messageBody = scheduleFunctions.composeBody(chores, roomie);
            console.log(messageBody);
            twilioClient.messages.create({
                body: messageBody,
                from: process.env.twilioNum,
                to: roomie.phoneNumber
            }).then(message => console.log(message));
        }
    }).catch(err => console.log(err));
});

// Just testing
const testAlert = schedule.scheduleJob({dayOfWeek: 2, hour: 18, second: 45}, () => {
    // db.Roomie.find({"name": "Devin"}).then(dbDevin => {
    //     console.log("Testing...\n");
    //     console.log(dbDevin);
    //     for (roomie of dbDevin) {
    //         twilioClient.messages.create({
    //             body: "testing...\n\n-1301 Chorechat",
    //             from: process.env.twilioNum,
    //             to: roomie.phoneNumber
    //         }).then(message => console.log(message));
    //     }
    // });
    console.log("\ntest alert firing every minute...\n");
});

//
// const testAlert2 = schedule.scheduleJob({dayOfWeek: 2, hour: 16, minute: 31}, () => {
//     db.Roomie.find({"name": "Devin"}).then(dbDevin => {
//         console.log(dbDevin);
//         for (roomie of dbDevin) {
//             twilioClient.messages.create({
//                 body: "testing #2...\n\n-1301 Chorechat",
//                 from: process.env.twilioNum,
//                 to: roomie.phoneNumber
//             }).then(message => console.log(message));
//         }
//     });
// });

// Rotate the chore duty list each Monday before the new chore notification is sent
const updateChores = new schedule.scheduleJob({dayOfWeek: 1, hour: 6, minute: 30}, () => {
    db.Roomie.find({}).then(dbUpdateRes => {
        console.log(dbUpdateRes);
        for (roomie of dbUpdateRes) {
            if (roomie.currentChore === 3) {
                // maybe refactor this with a ternary
                db.Roomie.findOneAndUpdate({"name": roomie.name}, {currentChore: 0}).then(res => {
                    console.log(res);
                }).catch(err => console.log(err));
            } else {
                db.Roomie.findOneAndUpdate({"name": roomie.name}, {currentChore: roomie.currentChore + 1}).then(res => {
                    console.log(res);
                }).catch(err => console.log(err));
            }
        }
    }).catch(err => console.log(err));
});

// Send sms reminder to any roommate who hasn't completed their chore on Thursday and Sunday
const choreReminders = new schedule.scheduleJob({dayOfWeek: [0, 4], hour: 8, minute: 30}, () => {
    db.Roomie.find({"choreComplete": false}).then(dbReminderRes => {
        // console.log(dbReminderRes);
        for (roomie of dbReminderRes) {
            twilioClient.messages.create({
                body: "Remember that your chore for the week is " + chores[roomie.currentChore].key + "\n\n-1301 Chorechat",
                from: process.env.twilioNum,
                to: roomie.phoneNumber
            }).then(message => console.log(message));
        }
    }).catch(err => console.log(err));
});

//
http.createServer(app).listen(PORT, () => {
    console.log("\nServer listening on PORT " + PORT);
});

// ping chorechat every 5 minutes to keep server running
setInterval(() => {
    console.log("pinging chorechat...\n");
    https.get("https://chorechat.herokuapp.com/");
}, 300000);