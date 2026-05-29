import stripe from "../config/stripe.js";
import Product from "../models/Product.js";

export const createCheckoutSession = async (req, res) => {
  try {
    console.log("ia ma here")
    const { productId } = req.body;

    // NEVER trust frontend price
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
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

    res.json({
      url: session.url,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: error.message,
    });
  }
};



export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
   console.log(" i am web hook")
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    console.log("Payment successful:", session.id);

    // Update database here
  }

  res.json({ received: true });
};