// const db = require("./models");

const scheduleFunctions = {
    // test: () => {
    //     console.log("hello world");
    // },
    // sendInitialChoreAlert: (twilioClient) => {
    //     db.Roomie.find({ "name": "Devin" }).then(dbRes => {
    //         console.log(dbRes);
    //         for (roomie of dbRes) {
    //             console.log(roomie.number);
    //             twilioClient.messages.create({
    //                 body: composeBody(roomie),
    //                 from: process.env.twilioNum,
    //                 to: roomie.number
    //             }).then(message => console.log(message));
    //         }
    //     }).catch(err => console.log(err));           
    // },
    composeBody: (chores, roomie) => {
        const body = [
            "Your chore for the week is " + chores[roomie.currentChore].key + " DUTY.\n",
            "\n",
            "Make sure to do the following at least once:\n",
            "\n",
            chores[roomie.currentChore].duties.join("\n"),
            "\n\n",
            "Reply DONE to this message once you've completed your chore to pause your remaining chore reminders for the week\n",
            "\n",
            "-1301 Chorechat"
        ].join("");
    
        return body;
    }
    // adjustChore: (roomieObj) => {
    //     const roomieCopy = roomieObj;
    //     if (roomieObj.currentChore === 3) {
    //         roomieCopy.currentChore = 0;
    //         return roomieCopy;
    //     }
    //     roomieCopy.currentChore += 1;
    //     return roomieCopy;
    // },
    // adjustChores: () => {
    //     for (var i = 0; i < 4; i++) {
    //         const updatedRoomie = adjustChore(roomies[i]);
    //         roomies[i] = updatedRoomie;
    //         roomies[i].choreComplete = false;
    //     }
    // }
    // determineReminder: () => {
    //     for (roomie of roomies) {
    //         if (!roomie.choreComplete) {
    //             // send reminder
    //         }
    //     }
    // }
}

module.exports = scheduleFunctions;