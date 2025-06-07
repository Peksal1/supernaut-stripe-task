const subscriptions = new Map();

module.exports = (req, res) => {
  const event = req.body;

  if (!event?.type || !event?.data?.object) {
    return res.status(400).send("Invalid event format");
  }

  const subscription = event.data.object;
  const id = subscription.id;
  const customerId = subscription.customer;
  const status = subscription.status;
  const currentPeriodEnd = subscription.current_period_end;

  subscriptions.set(id, {
    id,
    customerId,
    status,
    currentPeriodEnd,
  });

  console.log(`📬 Received event: ${event.type}`);
  console.table([...subscriptions.entries()]);

  res.sendStatus(200);
};
