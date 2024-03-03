const nodemailer = require("nodemailer");

const UnverifiedMessageToSend = require("../model/verificationCode");

const VerifiedMessages = require("../model/verifiedMessages");

module.exports.baseGet = (req, res) => {
    res.send("Pediatric Surgeon Server");
};

module.exports.submitHandler = async (req, res) => {
    console.log(req.body);

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
        },
    });

    function generateRandomAlphanumericString(length) {
        let result = "";
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(
                Math.floor(Math.random() * charactersLength)
            );
        }
        return result;
    }

    const randomString = generateRandomAlphanumericString(6);

    try {
        const emailFound = await UnverifiedMessageToSend.findOne({
            email: req.body.email,
        });

        if (emailFound) {
            console.log("the verification code has been already sent");
            return res.json({
                success: "pending",
                message: "the verification code has been already sent",
                url: `${process.env.CLIENT_ORIGIN}/verification/${emailFound.id}`,
            });
        }

        const emailToVerify = new UnverifiedMessageToSend({
            email: req.body.email,
            code: randomString,
            message: req.body.message,
            name: req.body.name,
            contact: req.body.contact,
        });
        await emailToVerify.save();

        let mailOptions = {
            from: process.env.EMAIL,
            to: req.body.email,
            subject: "Email Verification",
            text: `Mr/Mrs ${req.body.name}. Your email Verification Code for Pediaric Surgeon is ${randomString}`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.error(error);
                return res.json({
                    success: false,
                    error,
                    url: `${process.env.CLIENT_ORIGIN}/error`,
                });
            } else {
                console.log("Email sent: " + info.response);
                res.json({
                    url: `${process.env.CLIENT_ORIGIN}/verification/${emailToVerify.id}`,
                });
            }
        });
        setTimeout(async () => {
            await UnverifiedMessageToSend.findOneAndDelete({
                email: req.body.email,
            });
            console.log("Verification code deleted.");
        }, 5 * 60 * 1000);
    } catch (error) {
        console.log(error);
        return res.json({ success: false, error });
    }
};

module.exports.getEmailToVerify = async (req, res) => {
    const id = req.params.id;
    console.log(id, "getting message to verify");

    try {
        const messageToVerify = await UnverifiedMessageToSend.findById(id);
        console.log("found message", messageToVerify);
        res.json({ email: messageToVerify.email });
    } catch (err) {
        res.json({ error: err });
    }
};

module.exports.verifyCode = async (req, res) => {
    const id = req.params.id;
    console.log(req.body);

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
        },
    });

    try {
        const messageToVerify = await UnverifiedMessageToSend.findById(id);
        console.log("found message", messageToVerify);
        if (!messageToVerify) {
            res.json({
                success: false,
                message: "your verification code has expired",
            });
        }
        if (req.body.code === messageToVerify.code) {
            const verifyMailOptions = {
                from: process.env.EMAIL,
                to: messageToVerify.email,
                subject: "Email Verified",
                text: `Mr/Mrs ${messageToVerify.name}. Your Message has been recorded, We will reach back to you soon`,
            };

            const verifiedMessage = new VerifiedMessages({
                email: messageToVerify.email,
                message: messageToVerify.message,
                name: messageToVerify.name,
                contact: messageToVerify.contact,
            });

            await verifiedMessage.save();

            const mailToBeSentToDoc = {
                from: process.env.EMAIL,
                to: process.env.SUP_EMAIL,
                subject: "You have new Message from Pediatric Surgeon",
                html: `
                    <p><strong>Name:</strong> ${messageToVerify.name}</p>
                    <p><strong>Contact:</strong> ${messageToVerify.contact}</p>
                    <p><strong>Email:</strong> ${messageToVerify.email}</p>
                    <p><strong>Message:</strong> ${messageToVerify.message}</p>
                `,
            };
            transporter.sendMail(mailToBeSentToDoc, function (error, info) {
                if (error) {
                    console.error(error);
                    return res.json({
                        success: false,
                        error,
                        url: `${process.env.CLIENT_ORIGIN}/error`,
                    });
                } else {
                    console.log("Email sent: " + info.response);
                    transporter.sendMail(
                        verifyMailOptions,
                        function (error, info) {
                            if (error) {
                                console.error(error);
                                return res.json({
                                    success: false,
                                    error,
                                    url: `${process.env.CLIENT_ORIGIN}/error`,
                                });
                            } else {
                                res.json({
                                    url: `${process.env.CLIENT_ORIGIN}/verification/${emailToVerify.id}`,
                                });
                            }
                        }
                    );
                }
            });
            res.json({
                success: true,
                message: "your message has been recorded",
            });
        } else {
            res.json({
                success: false,
                message: "verification code doesnt match",
            });
        }
    } catch (err) {
        console.log(err);
        res.json({ error: err });
    }
};
