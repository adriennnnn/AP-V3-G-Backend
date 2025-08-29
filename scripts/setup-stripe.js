const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

async function setupStripePlans() {
  try {
    console.log('Setting up Stripe plans...');

    // Create Basic plan
    const basicProduct = await stripe.products.create({
      name: 'Basic Plan',
      description: 'Basic subscription plan with limited features',
    });

    const basicPrice = await stripe.prices.create({
      product: basicProduct.id,
      unit_amount: 999, // $9.99
      currency: 'eur',
      recurring: {
        interval: 'month',
      },
    });

    console.log('Basic Plan created:');
    console.log(`Product ID: ${basicProduct.id}`);
    console.log(`Price ID: ${basicPrice.id}`);

    // Create Standard plan
    const standardProduct = await stripe.products.create({
      name: 'Standard Plan',
      description: 'Standard subscription plan with more features',
    });

    const standardPrice = await stripe.prices.create({
      product: standardProduct.id,
      unit_amount: 1999, // $19.99
      currency: 'eur',
      recurring: {
        interval: 'month',
      },
    });

    console.log('Standard Plan created:');
    console.log(`Product ID: ${standardProduct.id}`);
    console.log(`Price ID: ${standardPrice.id}`);

    // Create Premium plan
    const premiumProduct = await stripe.products.create({
      name: 'Premium Plan',
      description: 'Premium subscription plan with all features',
    });

    const premiumPrice = await stripe.prices.create({
      product: premiumProduct.id,
      unit_amount: 3999, // $39.99
      currency: 'eur',
      recurring: {
        interval: 'month',
      },
    });

    console.log('Premium Plan created:');
    console.log(`Product ID: ${premiumProduct.id}`);
    console.log(`Price ID: ${premiumPrice.id}`);

    console.log('\nAdd these to your .env file:');
    console.log(`STRIPE_BASIC_PRICE_ID=${basicPrice.id}`);
    console.log(`STRIPE_STANDARD_PRICE_ID=${standardPrice.id}`);
    console.log(`STRIPE_PREMIUM_PRICE_ID=${premiumPrice.id}`);

  } catch (error) {
    console.error('Error setting up Stripe plans:', error);
  }
}

setupStripePlans();
