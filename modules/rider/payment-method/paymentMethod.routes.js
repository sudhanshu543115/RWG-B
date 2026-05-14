import express from "express";

import {
   addPaymentMethod,
   getPaymentMethods,
   deletePaymentMethod
} from "./paymentMethod.controller.js";

import { protectRider }
from "../../../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRider);

router.post("/", addPaymentMethod);

router.get("/", getPaymentMethods);

router.delete("/:id", deletePaymentMethod);

export default router;