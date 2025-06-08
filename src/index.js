const express = require("express");
const bodyParser = require("body-parser");
const { webhookHandler } = require("./webhookHandler");
const db = require("./db");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.post("/webhook", webhookHandler);

app.get("/subscriptions", (req, res) => {
  const rows = db.prepare(`SELECT * FROM subscriptions`).all();
  res.json(rows);
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
