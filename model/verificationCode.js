const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema({
    email: { type: String, required: true },
    name: { type: String, required: true },
    code: { type: String, require: true },
    message: { type: String, required: true },
    contact: { type: Number, required: true },
});

module.exports = mongoose.model("UnverifiedMessageToSend", verificationSchema);
