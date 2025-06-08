const db = require("./db");

function handleStripeEvent(event) {
  const subscription = event.data.object;
  const { id, customer, status, current_period_end } = subscription;

  switch (event.type) {
    case "customer.subscription.created": {
      const existing = db
        .prepare(`SELECT id FROM subscriptions WHERE id = ?`)
        .get(id);
      if (existing) {
        return {
          success: false,
          error: "already_exists",
          message: `Subscription ${id} already exists — cannot create duplicate`,
        };
      }

      db.prepare(
        `
        INSERT INTO subscriptions (id, customer_id, status, current_period_end)
        VALUES (?, ?, ?, ?)
      `
      ).run(id, customer, status, current_period_end);

      return {
        success: true,
        action: "created",
        subscription_id: id,
        status,
        current_period_end,
        message: `Created subscription ${id} (${status})`,
      };
    }

    case "customer.subscription.updated": {
      const existing = db
        .prepare(`SELECT * FROM subscriptions WHERE id = ?`)
        .get(id);
      if (!existing) {
        return {
          success: false,
          error: "not_found",
          message: `Subscription ${id} does not exist — cannot update`,
        };
      }

      if (existing.customer_id !== customer) {
        return {
          success: false,
          error: "customer_id_mismatch",
          message: `Subscription ${id} belongs to a different customer — update rejected`,
        };
      }

      db.prepare(
        `
        UPDATE subscriptions SET status = ?, current_period_end = ? WHERE id = ?
      `
      ).run(status, current_period_end, id);

      return {
        success: true,
        action: "updated",
        subscription_id: id,
        status,
        current_period_end,
        message: `Updated subscription ${id} — status: ${status}, current_period_end: ${current_period_end}`,
      };
    }

    case "customer.subscription.deleted": {
      const existing = db
        .prepare(`SELECT id FROM subscriptions WHERE id = ?`)
        .get(id);
      if (!existing) {
        return {
          success: false,
          error: "not_found",
          message: `Subscription ${id} does not exist — cannot delete`,
        };
      }

      db.prepare(`DELETE FROM subscriptions WHERE id = ?`).run(id);
      return {
        success: true,
        action: "deleted",
        subscription_id: id,
        message: `Deleted subscription ${id}`,
      };
    }

    default: {
      return {
        success: false,
        error: "unhandled_event",
        message: `Unhandled event type: ${event.type}`,
      };
    }
  }
}

function webhookHandler(req, res) {
  const event = req.body;

  if (!event || !event.type || !event.data || !event.data.object) {
    const errorResponse = {
      success: false,
      error: "invalid_payload",
      message: "Invalid event payload",
    };
    console.warn(errorResponse.message);
    return res.status(400).json(errorResponse);
  }

  const result = handleStripeEvent(event);

  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(400).json(result);
  }
}

module.exports = { webhookHandler };
