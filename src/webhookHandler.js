const db = require("./db");

function handleStripeEvent(event) {
  const subscription = event.data.object;
  const { id, customer, status, current_period_end } = subscription;

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const stmt = db.prepare(`
        INSERT INTO subscriptions (id, customer_id, status, current_period_end)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          customer_id = excluded.customer_id,
          status = excluded.status,
          current_period_end = excluded.current_period_end
      `);
      stmt.run(id, customer, status, current_period_end);
      console.log(`Saved subscription ${id} (${status})`);
      break;
    }

    case "customer.subscription.deleted": {
      const stmt = db.prepare(`DELETE FROM subscriptions WHERE id = ?`);
      stmt.run(id);
      console.log(`Deleted subscription ${id}`);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

module.exports = { handleStripeEvent };
