// Node dependencies

const schedule = require("node-schedule");
require("dotenv").config();
const client = require("twilio")(process.env.accountSid, process.env.authToken);

// Roomie & Chore Data

const chores = require("./chores.js");

const roomies = [
    {
        name: "Devin",
        number: process.env.devin,
        currentChore: 0,
        choreComplete: false
    }
    // {
    //     name: "Peter",
    //     number: process.env.peter,
    //     currentChore: 2,
    //     choreComplete: false
    // },
    // {
    //     name: "Gabe",
    //     number: process.env.gabe,
    //     currentChore: 3,
    //     choreComplete: false
    // },
    // {
    //     name: "Brett",
    //     number: process.env.brett,
    //     currentChore: 4,
    //     choreComplete: false
    // }
]

// Chore Functions & Alerts

const sendInitialChoreAlert = () => {
    for (roomie of roomies) {
        client.messages.create({
            body: composeBody(roomie),
            from: process.env.twilioNum,
            to: roomie.number
        }).then(message => console.log(message));
    }
}

const composeBody = (roomie) => {
    const body = [
        "Your chore for the week is " + chores[roomie.currentChore].key + " DUTY.\n",
        "\n",
        "Make sure to:\n",
        "\n",
        chores[roomie.currentChore].duties.join("\n")
    ].join("");

    return body;
}

// const alertChoreRule = new schedule.RecurrenceRule();
// alertChoreRule.dayOfWeek = 1;
// alertChoreRule.hour = 8;

// const alertChore = schedule.scheduleJob(alertChoreRule, sendInitialChoreAlert);

// const adjustChore = (roomieObj) => {
//     const roomieCopy = roomieObj;
//     if (roomieObj.currentChore === 3) {
//         roomieCopy.currentChore = 0;
//         return roomieCopy;
//     }
//     roomieCopy.currentChore += 1;
//     return roomieCopy;
// }

// const adjustChores = () => {
//     for (var i = 0; i < 4; i++) {
//         const updatedRoomie = adjustChore(roomies[i]);
//         roomies[i] = updatedRoomie;
//         roomies[i].choreComplete = false;
//     }
// }

// const adjustChoreRule = new schedule.RecurrenceRule();
// adjustChoreRule.dayOfWeek = 1;
// adjustChoreRule.hour = 6;

// const updateChores = new schedule.scheduleJob(adjustChoreRule, adjustChores);

// const determineReminder = () => {
//     for (roomie of roomies) {
//         if (!roomie.choreComplete) {
//             // send reminder
//         }
//     }
// }

// const choreReminderRule = new schedule.RecurrenceRule();
// choreReminderRule.dayOfWeek = [0, 4];
// choreReminderRule.hour = 8;

// const choreReminders = new schedule.scheduleJob(choreReminderRule, determineReminder);

sendInitialChoreAlert();









