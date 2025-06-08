# Supernaut Webhook Task

A backend mock service for simulating Stripe webhook handling. It listens to Stripe-style events related to subscriptions (`created`, `updated`, and `deleted`) and stores subscription data in a local SQLite database.

## 📦 Features

- Stores subscription events in SQLite
- Handles creation, update, and deletion of subscriptions
- Prevents duplicate creation and invalid updates
- Rejects updates that attempt to change `customer_id`
- Returns structured JSON responses with clear success or error messages
- Exposes an API to list all saved subscriptions

## 📌 Requirements

- Node.js ≥ 14
- npm
- Postman or any HTTP API client

## 🚀 Getting Started

1. Clone the repo:

   ```
   git clone https://github.com/your-username/stripe-subscription-webhook.git
   cd stripe-subscription-webhook
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the server:

   ```
   npm run dev
   ```

   Server will run at:  
   http://localhost:3000

## 📡 Endpoints

### 1. POST /webhook

Accepts Stripe-style webhook events. Supported event types:

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

**Example Request Payload:**

```json
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
```

**Example Success Response (create):**

```json
{
  "success": true,
  "action": "created",
  "subscription_id": "sub_123",
  "status": "active",
  "current_period_end": 1735689600,
  "message": "Created subscription sub_123 (active)"
}
```

**Example Error Response (create duplicate):**

```json
{
  "success": false,
  "error": "already_exists",
  "message": "Subscription sub_123 already exists — cannot create duplicate"
}
```

**Example Error Response (update non-existing):**

```json
{
  "success": false,
  "error": "not_found",
  "message": "Subscription sub_999 does not exist — cannot update"
}
```

**Example Error Response (customer_id mismatch):**

```json
{
  "success": false,
  "error": "customer_id_mismatch",
  "message": "Subscription sub_123 belongs to a different customer — update rejected"
}
```

**You can test this using Postman:**

- URL: http://localhost:3000/webhook
- Method: POST
- Headers: Content-Type: application/json
- Body: raw JSON payload (as shown above)

---

### 2. GET /subscriptions

Returns a list of all stored subscriptions.

**Example Response:**

```json
[
  {
    "id": "sub_123",
    "customer_id": "cus_456",
    "status": "active",
    "current_period_end": 1735689600
  }
]
```

### 3. GET /subscriptions/:id

Checks the status of a specific subscription by ID.

### Request:

GET /subscriptions/sub_123

**Success Response:**

```json
{
  "success": true,
  "subscription_id": "sub_123",
  "customer_id": "cus_456",
  "status": "active",
  "current_period_end": 1735689600,
  "is_active": true,
  "message": "Subscription sub_123 is active"
}
```

**Error Response (Not Found):**

```json
{
  "success": false,
  "error": "not_found",
  "message": "Subscription sub_999 not found"
}
```

---

## ❗ Notes

- Subscription `id` is unique and enforced.
- `created` events strictly insert new subscriptions and fail if the ID already exists.
- `updated` events require the subscription to already exist and match the `customer_id`.
- `deleted` events also require the subscription to exist.
- Clear JSON responses make it easy to debug using Postman or in tests.

## 🛠 Database

- Uses `better-sqlite3` for fast, synchronous access
- Database file `subscriptions.db` is auto-created on first run.
