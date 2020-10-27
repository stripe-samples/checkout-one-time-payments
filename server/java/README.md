# Checkout single product

## Requirements

- Maven
- Java

## How to run

1. Confirm `.env` configuration

This sample requires a Price ID in the `PRICE` environment variable.

Open `.env` and confirm `PRICE` is set equal to the ID of a Price from your
Stripe account. It should look something like:

```
PRICE=price_1Hh1ZeCZ6qsJgndJaX9fauRl
```

Note that `price_12345` is a placeholder and the sample will not work with that
price ID.


2. Build the jar

```
mvn package
```

2. Run the packaged jar

```
java -cp target/single-product-checkout-1.0.0-SNAPSHOT-jar-with-dependencies.jar com.stripe.sample.Server
```

4. If you're using the html client, go to `localhost:4242` to see the demo. For
   react, visit `localhost:3000`.
