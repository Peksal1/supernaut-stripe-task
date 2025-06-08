const db = require("./db");

function handleStripeEvent(event) {
  const subscription = event.data.object;
  const { id, customer, status, current_period_end } = subscription;

  const exists = db.prepare(`SELECT 1 FROM subscriptions WHERE id = ?`).get(id);

  switch (event.type) {
    case "customer.subscription.created": {
      if (exists) {
        console.log(`Subscription ${id} already exists, skipping creation.`);
      } else {
        const stmt = db.prepare(`
          INSERT INTO subscriptions (id, customer_id, status, current_period_end)
          VALUES (?, ?, ?, ?)
        `);
        stmt.run(id, customer, status, current_period_end);
        console.log(`Created subscription ${id} (${status})`);
      }
      break;
    }

    case "customer.subscription.updated": {
      if (!exists) {
        console.log(`Subscription ${id} not found, skipping update.`);
      } else {
        const stmt = db.prepare(`
          UPDATE subscriptions SET
            customer_id = ?,
            status = ?,
            current_period_end = ?
          WHERE id = ?
        `);
        stmt.run(customer, status, current_period_end, id);
        console.log(`Updated subscription ${id} (${status})`);
      }
      break;
    }

    case "customer.subscription.deleted": {
      if (!exists) {
        console.log(`Subscription ${id} not found, skipping delete.`);
      } else {
        const stmt = db.prepare(`DELETE FROM subscriptions WHERE id = ?`);
        stmt.run(id);
        console.log(`Deleted subscription ${id}`);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

module.exports = { handleStripeEvent };
