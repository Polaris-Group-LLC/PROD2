const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const plans = [
  {
    name: "Basic-Test",
    price: 1000,
    features: [
      { name: "Upto 10 users" },
      { name: "Upto 1000 records" },
      { name: "Upto 1000 API calls" },
    ],
  },
  {
    name: "Pro-Test",
    price: 2000,
    features: [
      { name: "Upto 100 users" },
      { name: "Upto 10000 records" },
      { name: "Upto 10000 API calls" },
    ],
  },
  {
    name: "CleoGod",
    price: 5000,
    features: [
      { name: "Unlimited users" },
      { name: "Unlimited records" },
      { name: "Unlimited API calls" },
    ],
  },
];

async function createProducts() {
  for (const plan of plans) {
    try {
      // Create product
      const product = await stripe.products.create({
        name: plan.name,
        description: `${plan.name} Plan`,
        metadata: {
          features: JSON.stringify(plan.features),
        },
      });

      // Create price for the product
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: "usd",
        recurring: {
          interval: "month",
        },
      });

      // Create webhook endpoint
      const webhookEndpoint = await stripe.webhookEndpoints.create({
        url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/webhook/stripe`,
        enabled_events: [
          "customer.subscription.created",
          "customer.subscription.updated",
          "customer.subscription.deleted",
        ],
      });

      console.log(`Created ${plan.name} with price ${price.id}`);
    } catch (error) {
      console.error(`Error creating ${plan.name}:`, error.message);
    }
  }
}

createProducts();
