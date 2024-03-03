const mongoose = require("mongoose");

const verifiedMessageSchema = new mongoose.Schema({
    email: { type: String, required: true },
    message: { type: String, required: true },
    name: { type: String, required: true },
    contact: { type: Number, required: true },
});

module.exports = mongoose.model("VerifiedMessages", verifiedMessageSchema);
