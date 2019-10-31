# Using Checkout for one-time purchases (client-only integration)

You can create Checkout pages without a server by creating Products and SKUs in the Stripe Dashboard before launching your integration. Then pass the SKU ID of your Product to `stripe.redirectToCheckout` on the client when your customer checks out. 

<img src="https://storage.googleapis.com/stripe-samples-flow-charts/checkout-one-time-client-only.png" alt="A flowchart of the Checkout flow" align="center">
