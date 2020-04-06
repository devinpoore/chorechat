// TODO: Generalize the error catch function and replace in all db calls

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
// TODO: Uncomment deployed mongo link
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://" + process.env.mongoUser + ":" + process.env.mongoPW + "@ds251158.mlab.com:51158/heroku_5npspkxg";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true }).then(() => {
    console.log("\nMongoose successfully connected to chorechat db\n");
}).catch(err => {
    console.log(err);
});
mongoose.set("useFindAndModify", false);
mongoose.set("useUnifiedTopology", true);

const MessagingResponse = require("twilio").twiml.MessagingResponse;

const chores = require("./chores.js");

app.post("/sms", async (req, res) => {

    // console.log(req.body);

    if (req.body.Body.toLowerCase() === "done") {
        // series of actions are executed
        //
        // change the sender's chore status to done - DONE
        // increment their points by the appropriate amount - 
        // notify other roommates of chore completion - DONE

        let setCompletersName = "";
        let setChore = -1;

        await db.Roomie.findOneAndUpdate({ phoneNumber: req.body.From }, { choreComplete: true }).then(dbRes => {
            // console.log(dbRes);
            setCompletersName = dbRes.name;
            setChore = dbRes.currentChore;
        }).catch(err => console.log(err));

        // console.log(setCompletersName, setChore);

        const twiml = new MessagingResponse();
        twiml.message("\nThanks for helping to keep the Taj Mahal tidy!\n\nSee you next week!\n\n-1301 Chorechat");

        notifyRoomies(req.body.From, setChore, setCompletersName);

        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
    }
    res.end();
});

// TODO: Clean up console logs when thoroughly tested
const notifyRoomies = (phoneNumber, chore, completersName) => {
    // figure out the right query to avoid the 'if' below
    const completionMessage = completersName + " has marked their chore, " + chores[chore].key + " DUTY, complete\n\n-1301 Chorechat";

    // console.log(completionMessage);

    db.Roomie.find({}).then(dbRes => {
        for (roomie of dbRes) {
            if (roomie.phoneNumber !== phoneNumber) {

                // console.log("Sending completion message to " + roomie.name);

                // send completionMessage
                twilioClient.messages.create({
                    body: completionMessage,
                    from: process.env.twilioNum,
                    to: roomie.phoneNumber
                })
                //.then(message => console.log(message))
                .catch(err => console.log(err));
            }
        }
    }).catch(err => console.log(err));
}

app.get("/", (req, res) => {
    res.send("<h2 style='font-family:monospace;font-weight:500;'>chorechat v0.2</h2>");
});

app.get("*", (req, res) => {
    res.redirect("/");
});

const scheduleFunctions = require("./scheduleFunctions.js");

//-------------------------------------------------------------------------

const buildWeeklyReport = (dbObj) => {
    let report = "1301 chorechat weekly report\n\n";
    
    var high_points = dbObj[0].points;

    var medal = 0;
    const medals = ["🥇 ", "🥈 ", "🥉 ", "◻ "]

    for (roomie of dbObj) {                
        var roomieString = "";        
        if (roomie.points === high_points) {
            roomieString+=medals[medal];
        } else {           
            if ((medal + 1) <= 3) {
                medal++;
            }
            roomieString+=medals[medal];
            high_points = roomie.points;
        }
        roomieString+=`${roomie.name} - ${roomie.points} ${roomie.points === 1 ? "pt" : "pts"} | ${roomie.point_delta === -3 ? "❌" : "✅"} | ${roomie.point_delta > -1 ? "+" : ""}${roomie.point_delta}\n`;
        roomieString+="--------------------------------------------\n";
        report+=roomieString;
    }

    return report;
}

const composeRoomieChores = (dbObj, roomie) => {
    const currRoomie = roomie.name;
    var roomieChores = "Weekly Roommate Chores:\n-----------------------------\n";
    // there's a better way to do this
    for (roommate of dbObj) {
        if (roommate.name !== currRoomie) {
            roomieChores+=`${roommate.name} - ${chores[roommate.currentChore].key} DUTY\n`;
        }
    };
    console.log(roomieChores);
    return roomieChores;
}

const testFunc = () => {
    db.Roomie.find({}).sort({ points: "desc" }).then( async (dbRes) => {    
        // console.log(dbRes);
        const messageBody = scheduleFunctions.composeBody(chores, dbRes[0]);
        const roomieChores = composeRoomieChores(dbRes, dbRes[0]);
        const weeklyReport = buildWeeklyReport(dbRes);

        // Send new weekly duty details
        await twilioClient.messages.create({
            body: messageBody,
            from: process.env.twilioNum,
            to: process.env.devin
        }).then(message => console.log(message));

        // Send other roommate chores
        await twilioClient.messages.create({
            body: roomieChores,
            from: process.env.twilioNum,
            to: process.env.devin
        }).then(message => console.log(message));

        // Send weekly report
        await twilioClient.messages.create({
            body: weeklyReport,
            from: process.env.twilioNum,
            to: process.env.devin
        }).then(message => console.log(message));

    }).catch(err => console.log(err));
}

// testFunc();

//-------------------------------------------------------------------------

// Send out the initial weekly chore duties to each roommate
const alertChores = schedule.scheduleJob({dayOfWeek: 1, hour: 8, minute: 30}, () => {

    const buildWeeklyReport = (dbObj) => {
        let report = "1301 CHORECHAT WEEKLY REPORT\n\n";
        
        var high_points = dbObj[0].points;
    
        var medal = 0;
        const medals = ["🥇 ", "🥈 ", "🥉 ", "◻ "]
    
        for (roomie of dbObj) {                
            var roomieString = "";        
            if (roomie.points === high_points) {
                roomieString+=medals[medal];
            } else {           
                if ((medal + 1) <= 3) {
                    medal++;
                }
                roomieString+=medals[medal];
                high_points = roomie.points;
            }
            roomieString+=`${roomie.name} - ${roomie.points} ${roomie.points === 1 ? "pt" : "pts"} | ${roomie.point_delta === -3 ? "❌" : "✅"} | ${roomie.point_delta > -1 ? "+" : ""}${roomie.point_delta}\n`;
            roomieString+="--------------------------------------------\n";
            report+=roomieString;
        }
    
        return report;
    }

    const composeRoomieChores = (dbObj, roomie) => {
        const currRoomie = roomie.name;
        var roomieChores = "Weekly Roommate Chores:\n-----------------------------\n";
        // there's a better way to do this
        for (roommate of dbObj) {
            if (roommate.name !== currRoomie) {
                roomieChores+=`${roommate.name} - ${chores[roommate.currentChore].key} DUTY\n`;
            }
        };
        return roomieChores;
    }

    db.Roomie.find({}).sort({ points: "desc" }).then( async (dbRes) => {
        const weeklyReport = buildWeeklyReport(dbRes);

        for (roomie of dbRes) {
            const messageBody = scheduleFunctions.composeBody(chores, roomie);
            const roomieChores = composeRoomieChores(dbRes, roomie);

            // Send new weekly duty details
            await twilioClient.messages.create({
                body: messageBody,
                from: process.env.twilioNum,
                to: roomie.phoneNumber
            }).then(message => console.log(message));

            // Send other roommate chores
            await twilioClient.messages.create({
                body: roomieChores,
                from: process.env.twilioNum,
                to: roomie.phoneNumber
            }).then(message => console.log(message));

            // Send weekly report
            await twilioClient.messages.create({
                body: weeklyReport,
                from: process.env.twilioNum,
                to: roomie.phoneNumber
            }).then(message => console.log(message));
        }

    }).catch(err => console.log(err));
});

// Rotate the chore duty list each Monday before the new chore notification is sent
// TODO: Break the second database update into its own distinct portion of code using async await instead of nesting
const updateChores = new schedule.scheduleJob({dayOfWeek: 1, hour: 6, minute: 30}, () => {    
    db.Roomie.find({}).then(dbUpdateRes => {
        
        
        console.log(dbUpdateRes);
        for (roomie of dbUpdateRes) {
            
            // if (roomie.choreComplete === false) {

                // send them a shame bell gif and a message saying the high sparrow disapproves
                // do we want to track weekly streaks?

            // }

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
        db.Roomie.updateMany({ "choreComplete": true }, { "choreComplete": false }, { "multi": true }).then(updateRes => {
            console.log(updateRes);
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
});

// Send sms reminder to any roommate who hasn't completed their chore on Thursday and Sunday
const choreReminders = new schedule.scheduleJob({dayOfWeek: [0, 4], hour: 8, minute: 30}, () => {
    db.Roomie.find({"choreComplete": false}).then(dbReminderRes => {
        // console.log(dbReminderRes);
        for (roomie of dbReminderRes) {
            twilioClient.messages.create({
                body: "Remember that your chore for the week is " + chores[roomie.currentChore].key + " DUTY\n\n-1301 Chorechat",
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