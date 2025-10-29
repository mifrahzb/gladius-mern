import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async ({ amount, currency = 'usd', metadata = {} }) => {
  const intent = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
    automatic_payment_methods: { enabled: true }
  });
  return intent;
};

export const retrievePaymentIntent = async (id) => {
  return stripe.paymentIntents.retrieve(id);
};
