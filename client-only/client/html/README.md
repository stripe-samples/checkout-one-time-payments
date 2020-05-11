# Accept payments with Stripe Checkout (client-only integration)

You can create Checkout pages without a server by creating Products and Prices in the Stripe Dashboard before launching your integration. Then pass the Price ID of your Product to `stripe.redirectToCheckout` on the client when your customer checks out.

<img src="https://storage.googleapis.com/stripe-samples-flow-charts/checkout-one-time-client-only.png" alt="A flowchart of the Checkout flow" align="center">

## Setup

- Enable client-only checkout: https://dashboard.stripe.com/account/checkout/settings
- Create a one-time or recurring product in the Stripe Dashboard: https://dashboard.stripe.com/products
  - After creation click the "Use with checkout" button and copy the price (price_xxx) ID.
  - Paste the price ID into the `PRICE_ID` var in the index.html file.
- Copy your publishable key from: https://dashboard.stripe.com/apikeys and set it as the value for `PUBLISHABLE_KEY` in the index.html file

## Run locally

From the project directory, navigate to this folder:

    cd client-only/client

Since these are all static assets you can serve them locally with a simple web server, e.g.

    python -m SimpleHTTPServer 4242

You can now view your page at http://localhost:4242

If you're getting an error running this command, see more detailed insturctions on [MDN](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server).

## Go live

- Add your domain name to the whitelist in https://dashboard.stripe.com/account/checkout/settings
- Replace the test publishable key `PUBLISHABLE_KEY` in the index.html file with your pk_live_xxx key which can be found here: https://dashboard.stripe.com/test/apikeys
  - (!!!**NOTE**!!!: never paste in your secret key! For client-only Checkout only the publishable key is needed!)
- Upload the files in this `client` folder to your hosting provider (there are many options available for static page hosting).
  - One convenient way is using [GitHub Pages](https://pages.github.com/). You can find an example for that here: https://github.com/stripe-samples/github-pages-stripe-checkout
