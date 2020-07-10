const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RoomieSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    phoneNumber: {
        type: String,
        require: true
    },
    currentChore: {
        type: Number,
        require: true
    },
    choreComplete: {
        type: Boolean,
        require: true
    },
    points: {
        type: Number,
        require: true,
        default: 0
    },
    point_delta: {
        type: Number,
        require: true,
        default: 0
    }
});

const Roomie = mongoose.model("Roomie", RoomieSchema);

module.exports = Roomie;