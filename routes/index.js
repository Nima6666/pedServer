var express = require("express");
var router = express.Router();

const controller = require("../controller/indexController");

router.get("/", controller.baseGet);

router.post("/mail", controller.submitHandler);

router.get("/mail/:id", controller.getEmailToVerify);

router.post("/mail/:id", controller.verifyCode);

module.exports = router;
