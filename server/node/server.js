const express = require("express");
const app = express();
const { resolve } = require("path");
const envPath = resolve("../.env.example");
const env = require("dotenv").config({ path: envPath });
const stripe = require("stripe")(env.parsed.STRIPE_SECRET_KEY);

app.use(express.static("../../client"));
app.use(express.json());

app.get("/", (req, res) => {
  const path = resolve("../../client/index.html");
  res.sendFile(path);
});

app.post("/", async (req, res) => {
  const { data } = req.body;

  res.send({
    someData: data
  });
});

app.listen(3000, () => console.log("Node server listening on port 3000!"));
