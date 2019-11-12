const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(express.urlencoded({ extended: false }));

const db = require("./models");

const roomies = [
    {
        name: "Devin",
        phoneNumber: process.env.devin,
        currentChore: 1,
        choreComplete: false
    },
    {
        name: "Peter",
        phoneNumber: process.env.peter,
        currentChore: 2,
        choreComplete: false
    },
    {
        name: "Gabe",
        phoneNumber: process.env.gabe,
        currentChore: 3,
        choreComplete: false
    },
    {
        name: "Brett",
        phoneNumber: process.env.brett,
        currentChore: 4,
        choreComplete: false
    }
]

// local mongo db connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/chorechat";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true }).then(() => {
    console.log("\nMongoose successfully connected to chorechat db\n");
    // for (roomie of roomies) {
    //     db.Roomie.create(roomie).then(user => {
    //         console.log("Successfully added\n", user, "\nto chorechat db");
    //     }).catch(err => console.log(err));
    // }
}).catch(err => {
    console.log(err);
});

mongoose.set("useFindAndModify", false);

const PORT = process.env.PORT || 4500;

const MessagingResponse = require("twilio").twiml.MessagingResponse;

app.post("/sms", (req, res) => {
    // console.log(req.body.Body);
    if (req.body.Body.toLowerCase() === "done") {
        // find database reference for this number and change chorecomplete to true
        // console.log(req.body.From);
        db.Roomie.findOneAndUpdate({ phoneNumber: req.body.From }, { choreComplete: true }).then(dbRes => {
            console.log(dbRes);
        }).catch(err => console.log(err));    
        
        const twiml = new MessagingResponse();
        twiml.message("\n\nThanks for helping to keep the Taj Mahal tidy!\n\nSee you next week!\n\n-Chorechat");
        
        res.writeHead(200, {"Content-Type": "text/xml"});
        res.end(twiml.toString());
    }
    res.end();
});

http.createServer(app).listen(PORT, () => {
    console.log("Server listening on PORT " + PORT);
});