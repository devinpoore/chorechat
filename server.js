const express = require("express");
const mongoose = require("mongoose");
const schedule = require("node-schedule");
const http = require("http");
require("dotenv").config();

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

const roomies = [
    {
        name: "Devin",
        number: process.env.devin,
        currentChore: 0,
        choreComplete: false
    }
    {
        name: "Peter",
        number: process.env.peter,
        currentChore: 2,
        choreComplete: false
    },
    {
        name: "Gabe",
        number: process.env.gabe,
        currentChore: 3,
        choreComplete: false
    },
    {
        name: "Brett",
        number: process.env.brett,
        currentChore: 4,
        choreComplete: false
    }
]

for (roomie of roomies) {
    db.Roomie.create(roomie).then(roomieRes => {
        console.log(roomieRes);
    }).catch(err => console.log(err));
}


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

// --------------------------------------------------------

// const alertChoreRule = new schedule.RecurrenceRule();
// alertChoreRule.dayOfWeek = 1;
// alertChoreRule.hour = 8;

// const alertChore = schedule.scheduleJob(alertChoreRule, scheduleFunctions.sendInitialChoreAlert);

// ---------------------------------------------------------

// const adjustChoreRule = new schedule.RecurrenceRule();
// adjustChoreRule.dayOfWeek = 1;
// adjustChoreRule.hour = 6;

// const updateChores = new schedule.scheduleJob(adjustChoreRule, scheduleFunctions.adjustChores);

// ---------------------------------------------------------

// const choreReminderRule = new schedule.RecurrenceRule();
// choreReminderRule.dayOfWeek = [0, 4];
// choreReminderRule.hour = 8;

// const choreReminders = new schedule.scheduleJob(choreReminderRule, scheduleFunctions.determineReminder);

//
http.createServer(app).listen(PORT, () => {
    console.log("Server listening on PORT " + PORT);
});