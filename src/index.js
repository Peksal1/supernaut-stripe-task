const express = require("express");
const bodyParser = require("body-parser");
const { handleStripeEvent } = require("./webhookHandler");
const db = require("./db");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.post("/webhook", (req, res) => {
  const event = req.body;
  handleStripeEvent(event);
  res.status(200).send("Event processed");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

app.get("/subscriptions", (req, res) => {
  const rows = db.prepare(`SELECT * FROM subscriptions`).all();
  res.json(rows);
});
