const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const PORT = process.env.PORT || 5000;

dotenv.config();


app.use(cors());
app.use(express.json());


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});