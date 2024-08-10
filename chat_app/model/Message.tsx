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