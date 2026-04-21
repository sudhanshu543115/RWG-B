const express = require("express");
const router = express.Router();

const { createOrder } = require("./payment.controller");

router.post("/create-order", createOrder);

module.exports = router;