import express from "express";

import {
  createConversation,
  getMessages
} from "./chat.controller.js";

const router = express.Router();

router.post("/conversation", createConversation);

router.get(
  "/messages/:id",
  getMessages
);

export default router;