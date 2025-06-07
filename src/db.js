const Database = require("better-sqlite3");
const db = new Database("subscriptions.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    status TEXT NOT NULL,
    current_period_end INTEGER
  )
`);

module.exports = db;
