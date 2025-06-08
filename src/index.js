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

app.get("/subscriptions/:id", (req, res) => {
  const { id } = req.params;
  const subscription = db
    .prepare("SELECT * FROM subscriptions WHERE id = ?")
    .get(id);

  if (!subscription) {
    return res.status(404).json({
      success: false,
      error: "not_found",
      message: `Subscription ${id} not found`,
    });
  }

  const isActive = subscription.status === "active";

  return res.json({
    success: true,
    subscription_id: subscription.id,
    customer_id: subscription.customer_id,
    status: subscription.status,
    current_period_end: subscription.current_period_end,
    is_active: isActive,
    message: `Subscription ${id} is ${isActive ? "active" : "not active"}`,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
