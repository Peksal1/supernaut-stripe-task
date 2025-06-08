# Supernaut Webhook Task

A backend mock service for simulating Stripe webhook handling. It listens to Stripe-style events related to subscriptions (`created`, `updated`, and `deleted`) and stores subscription data in a local SQLite database.

## 📦 Features

- Stores subscription events in SQLite
- Handles creation, update, and deletion of subscriptions
- Prevents invalid updates or deletes
- Returns structured JSON responses with detailed success or error messages
- Exposes an API to list all saved subscriptions

## 📌 Requirements

- Node.js ≥ 14
- npm
- Postman or any HTTP API client

## 🚀 Getting Started

1. Clone the repo:

   git clone https://github.com/your-username/stripe-subscription-webhook.git
   cd stripe-subscription-webhook

2. Install dependencies:

   npm install

3. Start the server:

   npm run dev

   Server will run at:
   http://localhost:3000

## 📡 Endpoints

### 1. POST /webhook

Accepts Stripe-style webhook events. Supported event types:

- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted

Example Request Payload:

{
"type": "customer.subscription.created",
"data": {
"object": {
"id": "sub_123",
"customer": "cus_456",
"status": "active",
"current_period_end": 1735689600
}
}
}

Example Success Response:

{
"success": true,
"action": "created_or_updated",
"subscription_id": "sub_123",
"status": "active",
"current_period_end": 1735689600,
"message": "Created or updated subscription sub_123 (active)"
}

Example Error Response (invalid update):

{
"success": false,
"error": "customer_id_mismatch",
"message": "Rejected update for sub_123 — changing customer_id is not allowed"
}

You can test this using Postman:

- URL: http://localhost:3000/webhook
- Method: POST
- Headers: Content-Type: application/json
- Body: raw JSON payload (like above)

---

### 2. GET /subscriptions

Returns a list of all stored subscriptions.

Example Response:

[
{
"id": "sub_123",
"customer_id": "cus_456",
"status": "active",
"current_period_end": 1735689600
}
]

---

## ❗ Notes

- Subscription `id` is unique and enforced in the database.
- `created` events perform UPSERT (insert or update).
- `updated` and `deleted` events require that the subscription already exists.
- Returns detailed JSON responses, useful for debugging in Postman or automated tests.

## 🛠 Database

- Uses better-sqlite3 for fast, synchronous access
- The SQLite database file is automatically created on first run (subscriptions.db)
