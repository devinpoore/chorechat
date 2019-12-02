const express = require("express");
const mongoose = require("mongoose");
const schedule = require("node-schedule");
const http = require("http");
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

const scheduleFunctions = require("./scheduleFunctions.js");
const chores = require("./chores.js");

// --------------------------------------------------------

// const alertChoreRule = new schedule.RecurrenceRule();
// alertChoreRule.dayOfWeek = 1;
// alertChoreRule.hour = 13;
// alertChoreRule.minute = 10;

// const alertChore = schedule.scheduleJob(alertChoreRule, scheduleFunctions.sendInitialChoreAlert(client));

const alertChores = schedule.scheduleJob({dayOfWeek: 2, hour: 8, minute: 30}, () => {
    db.Roomie.find({"name": "Devin"}).then(dbRes => {
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

// ---------------------------------------------------------

// const adjustChoreRule = new schedule.RecurrenceRule();
// adjustChoreRule.dayOfWeek = 1;
// adjustChoreRule.hour = 6;

// const updateChores = new schedule.scheduleJob(adjustChoreRule, scheduleFunctions.adjustChores);

const updateChores = new schedule.scheduleJob({dayOfWeek: 1, hour: 6, minute: 30}, () => {
    db.Roomie.find({}).then(dbUpdateRes => {
        console.log(dbUpdateRes);
        for (roomie of dbUpdateRes) {
            if (roomie.currentChore === 3) {
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

// ---------------------------------------------------------

// const choreReminderRule = new schedule.RecurrenceRule();
// choreReminderRule.dayOfWeek = [0, 4];
// choreReminderRule.hour = 8;

// const choreReminders = new schedule.scheduleJob(choreReminderRule, scheduleFunctions.determineReminder);

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