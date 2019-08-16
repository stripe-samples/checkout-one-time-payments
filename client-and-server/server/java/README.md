# Name of sample

## Requirements
* Maven
* Java

1. Build the jar
```
mvn package
```

2. Export environment variables
(the Java sample pulls environment variables from your system)

STATIC_DIR is used to serve static files (default to ../../client for this sample).
STRIPE_PUBLIC_KEY and STRIPE_SECRET_KEY are your Stripe API keys.

STRIPE_WEBHOOK_SECRET is required to use the webhook handler defined at /webhook.

DOMAIN is the domain to redirect the customer back to once they completed their purchase.

```
export STRIPE_PUBLIC_KEY=pk_replace_with_your_key
export STRIPE_SECRET_KEY=sk_replace_with_your_key
export STRIPE_WEBHOOK_SECRET=whsec_replace_with_your_key
export DOMAIN=https://your-domain.com
export STATIC_DIR=../../client
```

3. Run the packaged jar
```
java -cp target/single-product-checkout-1.0.0-SNAPSHOT-jar-with-dependencies.jar com.stripe.sample.Server
```

4. Go to `localhost:4242` in your browser to see the demo
