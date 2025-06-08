const db = require("./db");

function handleStripeEvent(event) {
  const subscription = event.data.object;
  const { id, customer, status, current_period_end } = subscription;

  switch (event.type) {
    case "customer.subscription.created": {
      const stmt = db.prepare(`
        INSERT INTO subscriptions (id, customer_id, status, current_period_end)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          customer_id = excluded.customer_id,
          status = excluded.status,
          current_period_end = excluded.current_period_end
      `);
      stmt.run(id, customer, status, current_period_end);
      console.log(`Created or updated subscription ${id} (${status})`);
      return true;
    }

    case "customer.subscription.updated": {
      const existing = db
        .prepare(`SELECT * FROM subscriptions WHERE id = ?`)
        .get(id);
      if (!existing) {
        console.warn(`Subscription ${id} does not exist — cannot update`);
        return false;
      }

      if (existing.customer_id !== customer) {
        console.warn(
          `Rejected update for ${id} — changing customer_id is not allowed`
        );
        return false;
      }

      const stmt = db.prepare(`
        UPDATE subscriptions SET status = ?, current_period_end = ? WHERE id = ?
      `);
      stmt.run(status, current_period_end, id);
      console.log(
        `Updated subscription ${id}: status=${status}, current_period_end=${current_period_end}`
      );
      return true;
    }

    case "customer.subscription.deleted": {
      const existing = db
        .prepare(`SELECT id FROM subscriptions WHERE id = ?`)
        .get(id);
      if (!existing) {
        console.warn(`Tried to delete non-existent subscription ${id}`);
        return false;
      }

      const stmt = db.prepare(`DELETE FROM subscriptions WHERE id = ?`);
      stmt.run(id);
      console.log(`Deleted subscription ${id}`);
      return true;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
      return false;
  }
}

function webhookHandler(req, res) {
  const event = req.body;

  if (!event || !event.type || !event.data || !event.data.object) {
    console.warn("Invalid event payload");
    return res.status(400).send("Invalid event");
  }

  const success = handleStripeEvent(event);

  if (success) {
    res.status(200).send("Event processed");
  } else {
    res.status(400).send("Event not handled");
  }
}

module.exports = { webhookHandler };
