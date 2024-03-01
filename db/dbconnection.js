const mongoose = require("mongoose");
const VerificationCode = require("../model/verificationCode");

mongoose
    .connect(process.env.DBSTRING)
    .then(console.log("connected to database"));

const cleanupVerificationCodes = async () => {
    try {
        await VerificationCode.deleteMany({});
        console.log("All verification codes deleted.");
    } catch (error) {
        console.error("Error deleting verification codes:", error);
    }
};
cleanupVerificationCodes();
