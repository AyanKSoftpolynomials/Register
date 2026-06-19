const express = require("express");

const controller =
  require("./auth.controller");

const router = express.Router();

router.post(
  "/register",
  controller.register
);

router.get(
  "/verify-email",
  controller.verifyEmail
);

module.exports = router;