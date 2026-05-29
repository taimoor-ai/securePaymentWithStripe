# Secure Stripe Payments — Phase 2: Secure Checkout Implementation

This phase implements a complete secure payment flow using Stripe Checkout Sessions with a full backend + frontend integration.

It focuses on building a  **real-world secure architecture** , where:

* backend is the source of truth
* frontend is only a UI layer
* payments are verified via webhooks
* database stores trusted order states

---

# Phase 2 Goal

Build a secure checkout system where:

* Products are stored in MongoDB
* Backend creates Stripe Checkout Sessions
* Frontend redirects users to Stripe-hosted checkout
* Payments are verified using Stripe Webhooks
* Orders are updated only after verified payment
* Secret keys remain protected on backend

---

# Final System Architecture

```text
React Frontend
      ↓
Express Backend
      ↓
MongoDB (Products & Orders)
      ↓
Stripe Checkout Session
      ↓
Stripe Hosted Payment Page
      ↓
Stripe Webhook Event
      ↓
Backend Verification
      ↓
Database Update (PAID / FAILED)
```

---

# Project Structure (Phase 2)

```bash
server/
│
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── stripe.js
│   │
│   ├── controllers/
│   │   ├── productController.js
│   │   └── paymentController.js
│   │
│   ├── models/
│   │   ├── Product.js
│   │   └── Order.js
│   │
│   ├── routes/
│   │   ├── productRoutes.js
│   │   └── paymentRoutes.js
│   │
│   ├── app.js
│
├── server.js
└── .env


client/
│
├── src/
│   ├── App.jsx
│   └── pages/
```

---

# Environment Variables

```env
PORT=5000
MONGO_URI=your_mongodb_uri

STRIPE_SECRET_KEY=sk_test_*****

STRIPE_WEBHOOK_SECRET=whsec_*****

CLIENT_URL=http://localhost:5173
```

---

# Step 1 — Product System (MongoDB)

## Product Model

```js
name: String
price: Number
description: String
```

Products are stored in MongoDB and act as the  **source of truth** .

---

## Product API

### Create Product

```
POST /api/products
```

### Get Products

```
GET /api/products
```

---

# Step 2 — Secure Checkout Session

The backend creates Stripe Checkout Sessions.

### Key Rule:

❌ Never trust frontend price
✅ Always use database price

---

## Checkout Flow

1. Frontend sends `productId`
2. Backend fetches product from DB
3. Backend creates Stripe session
4. Stripe returns checkout URL
5. Frontend redirects user

---

## Checkout Controller

```js
const product = await Product.findById(productId);

if (!product) {
  return res.status(404).json({ message: "Product not found" });
}

const session = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],

  line_items: [
    {
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
        },
        unit_amount: product.price * 100,
      },
      quantity: 1,
    },
  ],

  mode: "payment",

  success_url: `${process.env.CLIENT_URL}/success`,
  cancel_url: `${process.env.CLIENT_URL}/cancel`,
});
```

---

# Step 3 — Frontend Integration

Frontend only requests checkout session and redirects user.

```js
const handleCheckout = async (productId) => {
  const res = await axios.post(
    "http://localhost:5000/api/payments/create-checkout-session",
    { productId }
  );

  window.location.href = res.data.url;
};
```

---

# Step 4 — Stripe Webhook System

Webhooks are the MOST IMPORTANT part of secure payments.

They confirm real payment success.

---

## Why Webhooks Are Required

* Frontend success pages are NOT trusted
* Users can fake UI navigation
* Payments are asynchronous
* Only Stripe can confirm real payment

---

## Secure Payment Confirmation Flow

```text
User pays
   ↓
Stripe processes payment
   ↓
Stripe sends webhook event
   ↓
Backend verifies signature
   ↓
Database updated (PAID)
```

---

## Webhook Event Used

```text
checkout.session.completed
```

---

## Webhook Verification

```js
stripe.webhooks.constructEvent(
  req.body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

---

## Webhook Handler

```js
if (event.type === "checkout.session.completed") {
  const session = event.data.object;

  console.log("Payment successful:", session.id);

  // Update order in database here
}
```

---

# Step 5 — Order System (Important)

Orders track payment state.

## Order States

* PENDING
* PAID
* FAILED
* REFUNDED

---

## Order Flow

### Before Payment

```text
PENDING order created
```

### After Webhook

```text
PAID order updated
```

---

## Order Model Example

```js
userId: ObjectId
productId: ObjectId
stripeSessionId: String
status: PENDING | PAID | FAILED
```

---

# Step 6 — Security Principles Implemented

## 1. No frontend price trust

All pricing comes from MongoDB

## 2. Secret key protection

Stripe secret key stays in backend only

## 3. Webhook verification

All payment confirmations verified cryptographically

## 4. Database consistency

Orders only update after verified payment

## 5. Trust boundaries enforced

Frontend is untrusted layer

---

# Step 7 — Stripe CLI (Development Tool)

Used for local webhook testing.

```bash
stripe login
stripe listen --forward-to localhost:5000/api/payments/webhook
```

---

# Step 8 — Test Cards

Use Stripe test environment:

```
4242 4242 4242 4242
```

More test cards available in Stripe docs.

---

# Key Learnings from Phase 2

## Architecture Understanding

* frontend vs backend responsibilities
* payment system flow
* webhook-driven architecture

## Security Concepts

* price tampering prevention
* secret key protection
* webhook signature verification
* trust boundaries

## Backend Engineering Concepts

* event-driven systems
* asynchronous workflows
* database state transitions
* secure API design

---

# What You Built in Phase 2

A fully functional secure payment system that includes:

* product management (MongoDB)
* secure Stripe checkout flow
* webhook-based payment verification
* order tracking system
* frontend checkout integration
* production-grade architecture design

---

# Next Phase Preview

## Phase 3: Advanced Payment System

You will learn:

* subscriptions (SaaS billing)
* recurring payments
* invoice system
* failed payment handling
* billing portal
* customer management
* retry logic
* production deployment architecture

---

# Final Note

This phase represents a real-world backend payment system design where:

* Stripe handles financial processing
* backend controls business logic
* database stores verified truth
* frontend only handles user interaction

This is the foundation of any SaaS payment system.
