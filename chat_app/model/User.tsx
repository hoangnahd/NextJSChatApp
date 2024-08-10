import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default: "",
  },
  chats: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
    default: [],
  },
  isCameraOn: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now,
  }
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;