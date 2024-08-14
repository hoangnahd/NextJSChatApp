import mongoose from "mongoose";


const MessageSchema = new mongoose.Schema({
    Chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User"
    },
    audioCall: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"AudioCall"
    },
    seenBy: {
        type: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
        default: []
    },
    text: {
        type: String,
        default: ""
    },
    audio: {
        type: String,
        default: ""
    },
    response: {
        type: String,
        default: ""
    },
    timeCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    file: {
        type: String,
        default: ""
    }
})

const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema)

export default Message;