# Accept payments with Stripe Checkout (React client-only)

This is a React version of the HTML + Vanilla JavaScript client implementation. It works with any of the backends in the `server` folder.

## Setup

- Enable client-only checkout: https://dashboard.stripe.com/account/checkout/settings
- Create a one-time or recurring product in the Stripe Dashboard: https://dashboard.stripe.com/products
  - After creation click the "Use with checkout" button and copy the price (sku_xxx) ID.
- Set up the environment variables for React

```bash
cp .env.example .env
```

In the newly created `.env` file, set the values:

- Set the price ID that you created in the Dashboard for `REACT_APP_PRICE_ID`
- Copy your publishable key from: https://dashboard.stripe.com/apikeys and set it as the value for `REACT_APP_STRIPE_PUBLISHABLE_KEY`
- Set `REACT_APP_BASE_PRICE` and `REACT_APP_CURRENCY` to match your sku details from the Dashboard

## How to run

1. Install the dependecies

```bash
npm install
```

3. Start the React client

```bash
npm start
```

- Client running on http://localhost:3000

## Credits

- Author: [@thorsten-stripe](https://twitter.com/thorwebdev)
- This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
