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
    seenBy: {
        type: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
        default: []
    },
    text: {
        type: String,
        default: ""
    },
    photo: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema)

export default Message;