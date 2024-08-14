import mongoose from "mongoose";

const AudioCallSchema = new mongoose.Schema({
    isCalling: {
        type: Boolean, 
        default: false
    },
    response: {
        type: String,
        default: ""
    },
    timeCount: {
        type: Date,
        default: Date.now
    }

})

const AudioCall = mongoose.models.AudioCall || mongoose.model("AudioCall", AudioCallSchema)

export default AudioCall;