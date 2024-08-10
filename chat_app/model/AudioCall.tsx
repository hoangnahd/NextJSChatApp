import mongoose from "mongoose";

const generateRandomChannelName = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const AudioCallSchema = new mongoose.Schema({
    randomString: {
        type: String,
        default: generateRandomChannelName(64)
    },
    isCalling: {
        type: Boolean, 
        default: false
    },
    response: {
        type: String,
        default: ""
    },
    timeCall: {
        type: Date,
        default: Date.now()
    }

})

const AudioCall = mongoose.models.AudioCall || mongoose.model("AudioCall", AudioCallSchema)

export default AudioCall;